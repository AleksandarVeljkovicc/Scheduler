<?php

namespace Tests\Unit;

use App\Models\Reminder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ReminderModelTest extends TestCase
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
    public function it_can_create_a_reminder()
    {
        // Arrange & Act
        $reminder = Reminder::create([
            'subject' => 'Test Subject',
            'message' => 'Test Message',
            'date' => '2025-02-15',
        ]);

        // Assert
        $this->assertDatabaseHas('reminder', [
            'id' => $reminder->id,
            'subject' => 'Test Subject',
            'message' => 'Test Message',
            'date' => '2025-02-15',
        ]);

        $this->assertInstanceOf(Reminder::class, $reminder);
        $this->assertEquals('Test Subject', $reminder->subject);
        $this->assertEquals('Test Message', $reminder->message);
        $this->assertEquals('2025-02-15', $reminder->date);
    }

    /** @test */
    public function it_has_fillable_attributes()
    {
        // Arrange & Act
        $reminder = Reminder::create([
            'subject' => 'Fillable Subject',
            'message' => 'Fillable Message',
            'date' => '2025-02-20',
        ]);

        // Assert: Check that fillable attributes are set correctly
        $this->assertEquals('Fillable Subject', $reminder->subject);
        $this->assertEquals('Fillable Message', $reminder->message);
        $this->assertEquals('2025-02-20', $reminder->date);
    }

    /** @test */
    public function it_uses_correct_table_name()
    {
        // Arrange & Act
        $reminder = new Reminder();

        // Assert
        $this->assertEquals('reminder', $reminder->getTable());
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

        // Act: Update the reminder
        $reminder->update([
            'subject' => 'Updated Subject',
            'message' => 'Updated Message',
            'date' => '2025-03-15',
        ]);

        // Assert
        $this->assertDatabaseHas('reminder', [
            'id' => $reminder->id,
            'subject' => 'Updated Subject',
            'message' => 'Updated Message',
            'date' => '2025-03-15',
        ]);

        $reminder->refresh();
        $this->assertEquals('Updated Subject', $reminder->subject);
        $this->assertEquals('Updated Message', $reminder->message);
        $this->assertEquals('2025-03-15', $reminder->date);
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

        $reminderId = $reminder->id;

        // Act: Delete the reminder
        $reminder->delete();

        // Assert
        $this->assertDatabaseMissing('reminder', [
            'id' => $reminderId,
        ]);
    }

    /** @test */
    public function it_has_timestamps()
    {
        // Arrange & Act
        $reminder = Reminder::create([
            'subject' => 'Timestamps Test',
            'message' => 'Testing timestamps',
            'date' => '2025-02-15',
        ]);

        // Assert
        $this->assertNotNull($reminder->created_at);
        $this->assertNotNull($reminder->updated_at);
    }
}
