<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Reminder;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class ReminderController extends Controller
{
    public function index()
    {
        $reminders = Reminder::orderBy('date', 'asc')->get();
        return response()->json($reminders);
    }

    public function store(Request $request)
    {
        $request->validate([
            'subject' => 'required|string|max:255',
            'message' => 'required|string',
            'date' => 'required|date',
        ]);

        $reminder = Reminder::create([
            'subject' => $request->subject,
            'message' => $request->message,
            'date' => $request->date,
        ]);

        return response()->json([
            'message' => 'Reminder successfully created!',
            'reminder' => $reminder
        ], 201);
    }

    public function destroy($id)
    {
        $reminder = Reminder::find($id);

        if ($reminder) {
            $reminder->delete();
            return response()->json(['message' => 'Reminder deleted successfully']);
        }

        return response()->json(['message' => 'Reminder not found'], 404);
    }

    public function update(Request $request, $id): JsonResponse
    {
        $request->validate([
            'subject' => 'required|string|max:255',
            'message' => 'required|string',
            'date' => 'required|date',
        ]);

        $schedule = Reminder::find($id);

        if (!$schedule) {
            return response()->json(['error' => 'Schedule not found'], 404);
        }

        $schedule->subject = $request->input('subject');
        $schedule->message = $request->input('message');
        $schedule->date = $request->input('date');
        $schedule->save();

        return response()->json(['message' => 'Schedule updated successfully', 'schedule' => $schedule], 200);
    }
}
