<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class FlightStatus extends Model
{
   
    protected $table = 'flight_status'; 

    // Optional: primary key (default is 'id')
    protected $primaryKey = 'id';

    // Allow mass assignment
    protected $fillable = [
        'status_code',
        'status_name',
        'description',
        'id_status_code'
    ];

    // Timestamps
    public $timestamps = true;

    /**
     * Flights that belong to this status
     */
    public function flights()
    {
        return $this->hasMany(Flights::class, 'status_id');
    }
}
