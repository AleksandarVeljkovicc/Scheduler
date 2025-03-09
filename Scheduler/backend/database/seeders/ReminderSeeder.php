<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class ReminderSeeder extends Seeder
{
    public function run()
    {
        DB::table('reminder')->insert([
            [
                'subject' => 'Doctor Appointment',
                'message' => 'You have a doctor appointment on 20th March 2025.',
                'date' => Carbon::create('2025', '03', '20')->format('Y-m-d'),
            ],
            [
                'subject' => 'John Wick',
                'message' => 'Meeting scheduled with John at 3 PM on 22nd March 2025.',
                'date' => Carbon::create('2025', '03', '22')->format('Y-m-d'),
            ],
            [
                'subject' => 'Work Deadline',
                'message' => 'Submit the project report by the end of 25th March 2025.',
                'date' => Carbon::create('2025', '03', '25')->format('Y-m-d'),
            ]
        ]);
    }
}
