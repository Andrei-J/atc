<?php

namespace App\Http\Controllers;

use App\Models\Notam;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Inertia\Inertia;
use App\Services\NotamGenerator;
use Illuminate\Support\Facades\Log;
class NotamController extends Controller
{
    // Show all NOTAMs
    public function index()
    {
        return Inertia::render('Notams/Index', [
            'notams' => Notam::with('airport')->latest()->get(),
        ]);
    }

   public function edit(Request $request)
    {
        // Retrieve NOTAM ID from query params 
        $notamId = $request->query('id');
        
        if (!$notamId) {
            // Handle case where ID is missing (e.g., redirect or show error)
            return redirect()->route('notams.index')->with('error', 'NOTAM ID is required for editing.');
        }
        // Find NOTAM or fail
        $notam = Notam::findOrFail($notamId);
        // Return Inertia render for edit page, passing NOTAM data
        return Inertia::render('Notams/Edit', [
            'notam' => $notam,  // Pass NOTAM to frontend for editing
        ]);
    }

    public function update(Request $request, Notam $notam)
    {
        // Validate the request
        $request->validate([
            'message' => 'required|string|max:1000',  // Adjust validation as needed
        ]);
        // Update the NOTAM
        $notam->update([
            'message' => $request->message,
        ]);
        // Trigger the n8n webhook after successful update
        try {
            Http::post('https://n8n.larable.dev/webhook/78988c9e-532f-43ea-82f0-cca56a6f5a69', [
                'notam_id' => $notam->id,
                'airport_id' => $notam->airport_id,
                'city' => $notam->city,
                'message' => $notam->message,
                'updated_at' => now()->toISOString(),
                'query' =>'update',
                
            ]);
        } catch (\Exception $e) {
            // Log the error but don't fail the update
            Log::error('Failed to trigger n8n webhook for NOTAM update: ' . $e->getMessage());
        }
        // Redirect back to the NOTAMs index with success message
        return redirect()->route('notams.index')->with('success', 'NOTAM updated successfully.');
    }

    /**
     * Generate NOTAMs for multiple airports using n8n webhook
     */
    public function generateBatch(Request $request)
    {
        $airports  = array_slice($request->input('airports', []), 0, 10);
        $n8nWebhookUrl = 'https://n8n.larable.dev/webhook/c6b2403b-be4b-413d-82d1-db42fa2ff860';

        $generated = 0;
        $failed = 0;
        $errors = [];

        foreach ($airports as $airport) {

            // Build city + country code
            $cityQuery = $airport['city'];
            if (!empty($airport['country_code'])) {
                $cityQuery .= ',' . $airport['country_code'];
            }

            // Call webhook
            $response = Http::get($n8nWebhookUrl, [
                'city'  => $cityQuery,
                'units' => 'metric',
            ]);

            if ($response->failed()) {
                $failed++;
                $errors[] = "{$airport['iata_code']} – Webhook failed";
                continue;
            }

            $weatherData = $response->json();

            if (!is_array($weatherData) || empty($weatherData['weather'][0]['description'] ?? null)) {
                $failed++;
                $errors[] = "{$airport['iata_code']} – Invalid or missing weather data";
                continue;
            }

            // CREATE THE NOTAM MESSAGE
            $weatherDesc = strtolower($weatherData['weather'][0]['description'] ?? 'unknown');
            $windSpeed   = $weatherData['wind']['speed'] ?? 0;

            // Determine flight safety
            if (str_contains($weatherDesc, 'storm') || $windSpeed > 10) {
                $advice = "NOT ADVISED to take flight due to severe weather conditions.";
            } else {
                $advice = "Safe to take flight. Weather conditions are stable.";
            }

            // Generate Base NOTAM Format
            $notamContent = NotamGenerator::generate(
                $airport['city'],
                $airport['iata_code'],
                $weatherDesc, // Pass the weather description
                $windSpeed    // Pass the wind speed
            );

            // Append the detailed flight safety message below the structured NOTAM content
            $message =
                $notamContent . "\n" .
                "F) Weather Report: {$weatherData['weather'][0]['description']}. " .
                "Wind: {$windSpeed} m/s. " .
                $advice . "\n";


            // Skip duplicate
            $existing = Notam::where('airport_id', $airport['iata_code'])
                ->where('message', $message)
                ->first();

            if ($existing) {
                $errors[] = "{$airport['iata_code']} – Duplicate NOTAM skipped";
                continue;
            }

            // Save NOTAM in ATC database
            $notam = Notam::create([
                'airport_id' => $airport['iata_code'],
                'city'       => $airport['city'],
                'message'    => $message,
            ]);

            //Send NOTAM to n8n so it can insert into IAOS database
            Http::post('https://n8n.larable.dev/webhook/7789106c-df1f-4ead-b8b8-16332151bd99', [
                'airport_id' => $notam->airport_id,
                'city'       => $notam->city,
                'message'    => $notam->message,
            ]);

            $generated++;
        }

        return response()->json([
            'success'      => $generated > 0,
            'generated'    => $generated,
            'failed'       => $failed,
            'errors'       => $errors,
            'message'      => "{$generated} NOTAM(s) generated, {$failed} failed.",
        ]);
    }
}
