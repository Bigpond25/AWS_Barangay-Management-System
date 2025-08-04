<?php

namespace Tests\Feature;

use Tests\TestCase;
use App\Models\Resident;
use App\Models\Household;
use App\Models\Document;
use App\Models\Ticket;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Foundation\Testing\WithFaker;
use Laravel\Sanctum\Sanctum;

class ResidentRelationshipTest extends TestCase
{
    use RefreshDatabase, WithFaker;

    protected User $user;
    protected Resident $resident;

    protected function setUp(): void
    {
        parent::setUp();
        
        // Create and authenticate a user
        $this->user = User::factory()->create([
            'name' => 'Test Admin',
            'email' => 'admin@test.com',
            'role' => 'admin'
        ]);
        
        // Create a test resident
        $this->resident = Resident::factory()->create([
            'first_name' => 'John',
            'last_name' => 'Doe',
            'created_by' => $this->user->id
        ]);
        
        Sanctum::actingAs($this->user);
    }

    /** @test */
    public function it_can_load_resident_with_relationships()
    {
        // Create related data
        $household = Household::factory()->create(['head_id' => $this->resident->id]);
        $document = Document::factory()->create(['resident_id' => $this->resident->id]);
        $ticket = Ticket::factory()->create(['resident_id' => $this->resident->id]);

        $response = $this->getJson("/api/residents/{$this->resident->id}/relationships");

        $response->assertStatus(200)
                ->assertJsonStructure([
                    'data' => [
                        'id',
                        'first_name',
                        'last_name',
                        'households',
                        'documents',
                        'tickets',
                        'summary' => [
                            'total_documents',
                            'pending_documents',
                            'total_tickets',
                            'total_households'
                        ]
                    ]
                ]);

        $data = $response->json('data');
        $this->assertEquals(1, $data['summary']['total_documents']);
        $this->assertEquals(1, $data['summary']['total_tickets']);
        $this->assertEquals(1, $data['summary']['total_households']);
    }

    /** @test */
    public function it_can_get_resident_households()
    {
        // Create household where resident is head
        $householdAsHead = Household::factory()->create(['head_id' => $this->resident->id]);
        
        // Create another household where resident is member
        $otherHead = Resident::factory()->create();
        $householdAsMember = Household::factory()->create(['head_id' => $otherHead->id]);
        $householdAsMember->members()->attach($this->resident->id, ['relationship_to_head' => 'SPOUSE']);

        $response = $this->getJson("/api/residents/{$this->resident->id}/households");

        $response->assertStatus(200)
                ->assertJsonStructure([
                    'data' => [
                        'member_of_households',
                        'head_of_households',
                        'total_households'
                    ]
                ]);

        $data = $response->json('data');
        $this->assertEquals(2, $data['total_households']);
        $this->assertCount(1, $data['head_of_households']);
        $this->assertCount(1, $data['member_of_households']);
    }

    /** @test */
    public function it_can_get_resident_documents_with_filters()
    {
        // Create documents with different statuses
        Document::factory()->create([
            'resident_id' => $this->resident->id,
            'status' => 'PENDING',
            'type' => 'BARANGAY_CLEARANCE'
        ]);
        
        Document::factory()->create([
            'resident_id' => $this->resident->id,
            'status' => 'APPROVED',
            'type' => 'CERTIFICATE_OF_RESIDENCY'
        ]);

        // Test without filters
        $response = $this->getJson("/api/residents/{$this->resident->id}/documents");
        $response->assertStatus(200);
        $this->assertCount(2, $response->json('data'));

        // Test with status filter
        $response = $this->getJson("/api/residents/{$this->resident->id}/documents?status=PENDING");
        $response->assertStatus(200);
        $this->assertCount(1, $response->json('data'));
        $this->assertEquals('PENDING', $response->json('data.0.status'));

        // Test with type filter
        $response = $this->getJson("/api/residents/{$this->resident->id}/documents?type=BARANGAY_CLEARANCE");
        $response->assertStatus(200);
        $this->assertCount(1, $response->json('data'));
        $this->assertEquals('BARANGAY_CLEARANCE', $response->json('data.0.type'));
    }

    /** @test */
    public function it_can_get_resident_tickets_with_filters()
    {
        // Create tickets with different types and statuses
        Ticket::factory()->create([
            'resident_id' => $this->resident->id,
            'type' => 'APPOINTMENT',
            'status' => 'OPEN'
        ]);
        
        Ticket::factory()->create([
            'resident_id' => $this->resident->id,
            'type' => 'COMPLAINT',
            'status' => 'CLOSED'
        ]);

        // Test without filters
        $response = $this->getJson("/api/residents/{$this->resident->id}/tickets");
        $response->assertStatus(200);
        $this->assertCount(2, $response->json('data'));

        // Test with type filter
        $response = $this->getJson("/api/residents/{$this->resident->id}/tickets?type=APPOINTMENT");
        $response->assertStatus(200);
        $this->assertCount(1, $response->json('data'));
        $this->assertEquals('APPOINTMENT', $response->json('data.0.type'));

        // Test with status filter
        $response = $this->getJson("/api/residents/{$this->resident->id}/tickets?status=OPEN");
        $response->assertStatus(200);
        $this->assertCount(1, $response->json('data'));
        $this->assertEquals('OPEN', $response->json('data.0.status'));
    }

    /** @test */
    public function it_includes_relationships_when_requested_in_show_endpoint()
    {
        // Create related data
        Document::factory()->create(['resident_id' => $this->resident->id]);
        Ticket::factory()->create(['resident_id' => $this->resident->id]);

        // Test with include parameter
        $response = $this->getJson("/api/residents/{$this->resident->id}?include=documents,tickets");

        $response->assertStatus(200)
                ->assertJsonStructure([
                    'data' => [
                        'id',
                        'first_name',
                        'last_name',
                        'documents',
                        'tickets',
                        'total_documents',
                        'total_tickets'
                    ]
                ]);

        $data = $response->json('data');
        $this->assertNotEmpty($data['documents']);
        $this->assertNotEmpty($data['tickets']);
        $this->assertEquals(1, $data['total_documents']);
        $this->assertEquals(1, $data['total_tickets']);
    }

    /** @test */
    public function it_handles_resident_not_found_errors()
    {
        $nonExistentId = 'non-existent-uuid';

        $response = $this->getJson("/api/residents/{$nonExistentId}/relationships");
        $response->assertStatus(404);

        $response = $this->getJson("/api/residents/{$nonExistentId}/households");
        $response->assertStatus(404);

        $response = $this->getJson("/api/residents/{$nonExistentId}/documents");
        $response->assertStatus(404);

        $response = $this->getJson("/api/residents/{$nonExistentId}/tickets");
        $response->assertStatus(404);
    }

    /** @test */
    public function it_validates_pagination_for_documents_and_tickets()
    {
        // Create 20 documents to test pagination
        Document::factory(20)->create(['resident_id' => $this->resident->id]);

        $response = $this->getJson("/api/residents/{$this->resident->id}/documents");
        
        $response->assertStatus(200)
                ->assertJsonStructure([
                    'data',
                    'meta' => [
                        'current_page',
                        'last_page',
                        'per_page',
                        'total'
                    ]
                ]);

        $meta = $response->json('meta');
        $this->assertEquals(1, $meta['current_page']);
        $this->assertEquals(15, $meta['per_page']);
        $this->assertEquals(20, $meta['total']);
        $this->assertCount(15, $response->json('data')); // First page should have 15 items
    }

    /** @test */
    public function it_handles_unauthorized_access()
    {
        // Remove authentication
        $this->withoutMiddleware();
        auth()->logout();

        $response = $this->getJson("/api/residents/{$this->resident->id}/relationships");
        // Note: This might return 401 or 403 depending on middleware configuration
        $this->assertContains($response->status(), [401, 403]);
    }
}
