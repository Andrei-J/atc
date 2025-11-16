<?php

use App\Http\Controllers\FlightStatusController;
use App\Http\Controllers\AirportStatusController;
use App\Http\Controllers\NotamController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

    
Route::get('/', function () {
    return Inertia::render('auth/login');
});

Route::get('/home', function () {
    return Inertia::render('welcome');
})->name('home');


Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('dashboard', function () {
        return Inertia::render('dashboard');
    })->name('dashboard');


//Flight status Route
Route::get('/FlightStatus/Index', [FlightStatusController::class, 'index'])
    ->name('FlightStatus.index');

//airport status route
Route::get('/AirportStatus/Index', [AirportStatusController::class, 'index'])
    ->name('flight.status.index');

//for Notams functions
Route::post('/notams/generate', [NotamController::class, 'generate']);
Route::get('/notams', [NotamController::class, 'index'])->name('notams.index');
Route::put('/notams/{notam}', [NotamController::class, 'update'])->name('notams.update');
Route::get('/notams/edit', [NotamController::class, 'edit'])->name('notams.update');
// For updating (PUT request to save changes)



});

require __DIR__.'/settings.php';
require __DIR__.'/auth.php';
