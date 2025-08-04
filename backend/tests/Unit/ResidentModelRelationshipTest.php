<?php

namespace Tests\Unit;

use Tests\TestCase;
use App\Models\Resident;
use App\Models\Household;
use App\Models\Document;
use App\Models\Ticket;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Foundation\Testing\WithFaker;

class ResidentModelRelationshipTest extends TestCase
{
    use RefreshDatabase, WithFaker;

    protected User $user;
    protected Resident $resident;

    protected function setUp(): void
    {
        parent::setUp();
        
        $this->user = User::factory()->create();
        $this->resident = Resident::factory()->create(['created_by' => $this->user->id]);
    }

    /** @test */
    public function resident_has_documents_relationship()
    {
        $document = Document::factory()->create(['resident_id' => $this->resident->id]);
        
        $this->assertTrue($this->resident->documents()->exists());
        $this->assertEquals(1, $this->resident->documents()->count());
        $this->assertEquals($document->id, $this->resident->documents->first()->id);
    }

    /** @test */
    public function resident_has_tickets_relationship()
    {
        $ticket = Ticket::factory()->create(['resident_id' => $this->resident->id]);
        
        $this->assertTrue($this->resident->tickets()->exists());
        $this->assertEquals(1, $this->resident->tickets()->count());
        $this->assertEquals($ticket->id, $this->resident->tickets->first()->id);
    }

    /** @test */
    public function resident_has_household_relationships()
    {
        // Test households where resident is head
        $householdAsHead = Household::factory()->create(['head_id' => $this->resident->id]);
        
        $this->assertTrue($this->resident->householdsAsHead()->exists());
        $this->assertEquals(1, $this->resident->householdsAsHead()->count());
        $this->assertEquals($householdAsHead->id, $this->resident->householdsAsHead->first()->id);

        // Test households where resident is member
        $otherResident = Resident::factory()->create();
        $householdAsMember = Household::factory()->create(['head_id' => $otherResident->id]);
        $householdAsMember->members()->attach($this->resident->id, ['relationship_to_head' => 'SPOUSE']);

        $this->assertTrue($this->resident->households()->exists());
        $this->assertEquals(1, $this->resident->households()->count());
        $this->assertEquals($householdAsMember->id, $this->resident->households->first()->id);
    }

    /** @test */
    public function resident_has_complaint_relationship()
    {
        // Create a complaint ticket
        $complaint = Ticket::factory()->create([
            'resident_id' => $this->resident->id,
            'type' => 'COMPLAINT'
        ]);
        
        $this->assertTrue($this->resident->complaints()->exists());
        $this->assertEquals(1, $this->resident->complaints()->count());
        $this->assertEquals($complaint->id, $this->resident->complaints->first()->id);
    }

    /** @test */
    public function resident_has_appointment_relationship()
    {
        // Create an appointment ticket
        $appointment = Ticket::factory()->create([
            'resident_id' => $this->resident->id,
            'type' => 'APPOINTMENT'
        ]);
        
        $this->assertTrue($this->resident->appointments()->exists());
        $this->assertEquals(1, $this->resident->appointments()->count());
        $this->assertEquals($appointment->id, $this->resident->appointments->first()->id);
    }

    /** @test */
    public function resident_has_suggestion_relationship()
    {
        // Create a suggestion ticket
        $suggestion = Ticket::factory()->create([
            'resident_id' => $this->resident->id,
            'type' => 'SUGGESTION'
        ]);
        
        $this->assertTrue($this->resident->suggestions()->exists());
        $this->assertEquals(1, $this->resident->suggestions()->count());
        $this->assertEquals($suggestion->id, $this->resident->suggestions->first()->id);
    }

    /** @test */
    public function resident_has_audit_trail_relationships()
    {
        $this->assertTrue($this->resident->createdBy()->exists());
        $this->assertEquals($this->user->id, $this->resident->createdBy->id);

        // Test updated_by relationship
        $updater = User::factory()->create();
        $this->resident->update(['updated_by' => $updater->id]);
        
        $this->assertTrue($this->resident->updatedBy()->exists());
        $this->assertEquals($updater->id, $this->resident->updatedBy->id);
    }

    /** @test */
    public function document_belongs_to_resident()
    {
        $document = Document::factory()->create(['resident_id' => $this->resident->id]);
        
        $this->assertInstanceOf(Resident::class, $document->resident);
        $this->assertEquals($this->resident->id, $document->resident->id);
    }

    /** @test */
    public function ticket_belongs_to_resident()
    {
        $ticket = Ticket::factory()->create(['resident_id' => $this->resident->id]);
        
        $this->assertInstanceOf(Resident::class, $ticket->resident);
        $this->assertEquals($this->resident->id, $ticket->resident->id);
    }

    /** @test */
    public function household_belongs_to_head_resident()
    {
        $household = Household::factory()->create(['head_id' => $this->resident->id]);
        
        $this->assertInstanceOf(Resident::class, $household->head);
        $this->assertEquals($this->resident->id, $household->head->id);
    }

    /** @test */
    public function household_has_many_member_residents()
    {
        $household = Household::factory()->create(['head_id' => $this->resident->id]);
        
        $member1 = Resident::factory()->create();
        $member2 = Resident::factory()->create();
        
        $household->members()->attach([
            $member1->id => ['relationship_to_head' => 'SPOUSE'],
            $member2->id => ['relationship_to_head' => 'CHILD']
        ]);

        $this->assertEquals(2, $household->members()->count());
        $this->assertTrue($household->members->contains($member1));
        $this->assertTrue($household->members->contains($member2));
    }

    /** @test */
    public function resident_relationships_cascade_properly()
    {
        // Create related data
        $document = Document::factory()->create(['resident_id' => $this->resident->id]);
        $ticket = Ticket::factory()->create(['resident_id' => $this->resident->id]);
        $household = Household::factory()->create(['head_id' => $this->resident->id]);

        // Verify relationships exist
        $this->assertEquals(1, $this->resident->documents()->count());
        $this->assertEquals(1, $this->resident->tickets()->count());
        $this->assertEquals(1, $this->resident->householdsAsHead()->count());

        // Test soft delete (should preserve relationships)
        $this->resident->delete();
        
        // Resident should be soft deleted
        $this->assertSoftDeleted($this->resident);
        
        // Related records should still exist (depending on cascade rules)
        $this->assertDatabaseHas('documents', ['id' => $document->id]);
        $this->assertDatabaseHas('tickets', ['id' => $ticket->id]);
        $this->assertDatabaseHas('households', ['id' => $household->id]);
    }

    /** @test */
    public function relationship_pivot_data_is_accessible()
    {
        $household = Household::factory()->create(['head_id' => $this->resident->id]);
        $member = Resident::factory()->create();
        
        $household->members()->attach($member->id, [
            'relationship_to_head' => 'SPOUSE',
            'created_at' => now(),
            'updated_at' => now()
        ]);

        $memberWithPivot = $household->members()->wherePivot('relationship_to_head', 'SPOUSE')->first();
        
        $this->assertEquals('SPOUSE', $memberWithPivot->pivot->relationship_to_head);
        $this->assertEquals($member->id, $memberWithPivot->id);
    }
}
