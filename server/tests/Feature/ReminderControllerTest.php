<?php

namespace Tests\Feature;

use App\Models\Reminder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ReminderControllerTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        
        // Use SQLite in-memory database for testing
        config(['database.default' => 'sqlite']);
        config(['database.connections.sqlite.database' => ':memory:']);
    }

    /** @test */
    public function it_can_list_all_reminders()
    {
        // Arrange: Create some reminders
        $reminder1 = Reminder::create([
            'subject' => 'Test Subject 1',
            'message' => 'Test Message 1',
            'date' => '2025-02-15',
        ]);

        $reminder2 = Reminder::create([
            'subject' => 'Test Subject 2',
            'message' => 'Test Message 2',
            'date' => '2025-02-20',
        ]);

        // Act: Make GET request to /api/schedules
        $response = $this->getJson('/api/schedules');

        // Assert: Check response
        $response->assertStatus(200)
            ->assertJsonCount(2)
            ->assertJsonFragment([
                'subject' => 'Test Subject 1',
                'message' => 'Test Message 1',
                'date' => '2025-02-15',
            ])
            ->assertJsonFragment([
                'subject' => 'Test Subject 2',
                'message' => 'Test Message 2',
                'date' => '2025-02-20',
            ]);
    }

    /** @test */
    public function it_can_create_a_reminder()
    {
        // Arrange: Prepare reminder data
        $reminderData = [
            'subject' => 'New Reminder',
            'message' => 'This is a new reminder message',
            'date' => '2025-03-01',
        ];

        // Act: Make POST request to /api/schedule/add
        $response = $this->postJson('/api/schedule/add', $reminderData);

        // Assert: Check response and database
        $response->assertStatus(201)
            ->assertJson([
                'message' => 'Reminder successfully created!',
            ])
            ->assertJsonStructure([
                'message',
                'reminder' => ['id', 'subject', 'message', 'date', 'created_at', 'updated_at'],
            ]);

        $this->assertDatabaseHas('reminder', [
            'subject' => 'New Reminder',
            'message' => 'This is a new reminder message',
            'date' => '2025-03-01',
        ]);
    }

    /** @test */
    public function it_validates_required_fields_when_creating_reminder()
    {
        // Act: Make POST request without required fields
        $response = $this->postJson('/api/schedule/add', []);

        // Assert: Check validation errors
        $response->assertStatus(422)
            ->assertJsonValidationErrors(['subject', 'message', 'date']);
    }

    /** @test */
    public function it_validates_subject_max_length()
    {
        // Arrange: Create reminder with subject exceeding max length
        $reminderData = [
            'subject' => str_repeat('a', 256), // Exceeds max:255
            'message' => 'Valid message',
            'date' => '2025-03-01',
        ];

        // Act: Make POST request
        $response = $this->postJson('/api/schedule/add', $reminderData);

        // Assert: Check validation error
        $response->assertStatus(422)
            ->assertJsonValidationErrors(['subject']);
    }

    /** @test */
    public function it_validates_date_format()
    {
        // Arrange: Create reminder with invalid date format
        $reminderData = [
            'subject' => 'Valid Subject',
            'message' => 'Valid message',
            'date' => 'invalid-date',
        ];

        // Act: Make POST request
        $response = $this->postJson('/api/schedule/add', $reminderData);

        // Assert: Check validation error
        $response->assertStatus(422)
            ->assertJsonValidationErrors(['date']);
    }

    /** @test */
    public function it_can_update_a_reminder()
    {
        // Arrange: Create a reminder
        $reminder = Reminder::create([
            'subject' => 'Original Subject',
            'message' => 'Original Message',
            'date' => '2025-02-15',
        ]);

        $updateData = [
            'subject' => 'Updated Subject',
            'message' => 'Updated Message',
            'date' => '2025-03-15',
        ];

        // Act: Make PUT request to /api/schedule/edit/{id}
        $response = $this->putJson("/api/schedule/edit/{$reminder->id}", $updateData);

        // Assert: Check response and database
        $response->assertStatus(200)
            ->assertJson([
                'message' => 'Schedule updated successfully',
            ])
            ->assertJsonFragment([
                'subject' => 'Updated Subject',
                'message' => 'Updated Message',
                'date' => '2025-03-15',
            ]);

        $this->assertDatabaseHas('reminder', [
            'id' => $reminder->id,
            'subject' => 'Updated Subject',
            'message' => 'Updated Message',
            'date' => '2025-03-15',
        ]);
    }

    /** @test */
    public function it_returns_404_when_updating_nonexistent_reminder()
    {
        // Arrange: Use non-existent ID
        $updateData = [
            'subject' => 'Updated Subject',
            'message' => 'Updated Message',
            'date' => '2025-03-15',
        ];

        // Act: Make PUT request with non-existent ID
        $response = $this->putJson('/api/schedule/edit/99999', $updateData);

        // Assert: Check 404 response
        $response->assertStatus(404)
            ->assertJson([
                'error' => 'Schedule not found',
            ]);
    }

    /** @test */
    public function it_validates_required_fields_when_updating_reminder()
    {
        // Arrange: Create a reminder
        $reminder = Reminder::create([
            'subject' => 'Original Subject',
            'message' => 'Original Message',
            'date' => '2025-02-15',
        ]);

        // Act: Make PUT request without required fields
        $response = $this->putJson("/api/schedule/edit/{$reminder->id}", []);

        // Assert: Check validation errors
        $response->assertStatus(422)
            ->assertJsonValidationErrors(['subject', 'message', 'date']);
    }

    /** @test */
    public function it_can_delete_a_reminder()
    {
        // Arrange: Create a reminder
        $reminder = Reminder::create([
            'subject' => 'To Delete',
            'message' => 'This will be deleted',
            'date' => '2025-02-15',
        ]);

        // Act: Make DELETE request to /api/schedules/{id}
        $response = $this->deleteJson("/api/schedules/{$reminder->id}");

        // Assert: Check response and database
        $response->assertStatus(200)
            ->assertJson([
                'message' => 'Reminder deleted successfully',
            ]);

        $this->assertDatabaseMissing('reminder', [
            'id' => $reminder->id,
        ]);
    }

    /** @test */
    public function it_returns_404_when_deleting_nonexistent_reminder()
    {
        // Act: Make DELETE request with non-existent ID
        $response = $this->deleteJson('/api/schedules/99999');

        // Assert: Check 404 response
        $response->assertStatus(404)
            ->assertJson([
                'message' => 'Reminder not found',
            ]);
    }

    /** @test */
    public function it_orders_reminders_by_date_ascending()
    {
        // Arrange: Create reminders in random order
        $reminder3 = Reminder::create([
            'subject' => 'Third',
            'message' => 'Message 3',
            'date' => '2025-03-15',
        ]);

        $reminder1 = Reminder::create([
            'subject' => 'First',
            'message' => 'Message 1',
            'date' => '2025-02-15',
        ]);

        $reminder2 = Reminder::create([
            'subject' => 'Second',
            'message' => 'Message 2',
            'date' => '2025-03-01',
        ]);

        // Act: Make GET request
        $response = $this->getJson('/api/schedules');

        // Assert: Check order
        $response->assertStatus(200);
        $reminders = $response->json();
        
        $this->assertCount(3, $reminders);
        $this->assertEquals('2025-02-15', $reminders[0]['date']);
        $this->assertEquals('2025-03-01', $reminders[1]['date']);
        $this->assertEquals('2025-03-15', $reminders[2]['date']);
    }
}
