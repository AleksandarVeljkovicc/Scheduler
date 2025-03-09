<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\ReminderController;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider within a group which
| is assigned the "api" middleware group. Enjoy building your API!
|
*/

Route::middleware('auth:sanctum')->get('/user', function (Request $request) {
    return $request->user();
});

Route::get('/schedules', [ReminderController::class, 'index']);

Route::post('/schedule/add', [ReminderController::class, 'store']);

Route::delete('/schedules/{id}', [ReminderController::class, 'destroy']);

Route::put('/schedule/edit/{id}', [ReminderController::class, 'update']);


