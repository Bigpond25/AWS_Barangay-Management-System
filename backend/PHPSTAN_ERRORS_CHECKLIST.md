# PHPStan Errors Checklist

Total Errors: 308

## Batch 1: Resident Model Issues (5 errors)
- [ ] Line 42: PHPDoc type array<int, string> of property $fillable is not covariant
- [ ] Line 104: Property 'is_household_head' does not exist in model
- [ ] Line 326: Access to undefined property Pivot::$relationship
- [ ] Line 349: Method household() return type mismatch
- [ ] Line 381: Method currentOfficialPosition() return type mismatch

## Batch 2: Resident Model Issues Continued (5 errors)
- [ ] Line 631: Access to undefined property $is_household_head
- [ ] Line 641: Method getPrimaryHousehold() return type mismatch
- [ ] Line 925: Access to undefined property $is_household_head
- [ ] Line 232: Negated boolean expression is always false
- [ ] Line 251: Ternary operator condition is always true

## Batch 3: Resident Model Ternary Issues (3 errors)
- [ ] Line 299: Ternary operator condition is always true
- [ ] Line 317: Ternary operator condition is always true

## Batch 4: User Model Issues (5 errors)
- [ ] Line 91: Property 'is_barangay_official' does not exist in model
- [ ] Line 291: Offset on array always exists (nullCoalesce)
- [ ] Line 313: Offset on array always exists (nullCoalesce)
- [ ] Line 430: Method currentOfficialPosition() return type mismatch
- [ ] Line 527: Access to undefined property $is_barangay_official

## Batch 5: User Model Issues Continued (5 errors)
- [ ] Line 552: Offset on array always exists (nullCoalesce)
- [ ] Line 553: Offset on array always exists (nullCoalesce)
- [ ] Line 638: Access to undefined property $is_barangay_official

## Batch 6: Setting & Ticket Model Issues (3 errors)
- [ ] Setting.php Line 53: Unsafe usage of new static()
- [ ] Setting.php Line 68: Property $id (int) does not accept string
- [ ] Ticket.php Line 69: Unsafe call to private method through static::

## Batch 7: UserActivity & UserSession (6 errors)
- [ ] UserActivity.php Line 97: Access to undefined property $action (2x)
- [ ] UserActivity.php Line 110: Access to undefined property $resource (2x)
- [ ] UserSession.php Line 77: Access to undefined property $last_activity
- [ ] UserSession.php Line 149: Access to undefined property $last_activity

## Batch 8: LogsActivity Trait Issues (5 errors)
- [ ] Line 31: Parameter #2 $oldValues implicitly nullable
- [ ] Line 55: Parameter #2 $description implicitly nullable
- [ ] Line 55: Parameter #3 $oldValues implicitly nullable
- [ ] Line 55: Parameter #4 $newValues implicitly nullable
- [ ] Line 197: Access to undefined property $skipActivityLogging

## Batch 9: ProjectTeamMember Issues (5 errors)
- [ ] Line 83: Method getDaysInProjectAttribute() should return int but returns float
- [ ] Line 88: Access to undefined property $is_active
- [ ] Line 209: Access to undefined property $expertise
- [ ] Line 228: Access to undefined property $is_active (again)
- [ ] Line 228: Access to undefined property $receives_notifications

## Batch 10: ProjectTeamMember Continued (5 errors)
- [ ] Line 236: Access to undefined property Model::$first_name
- [ ] Line 236: Access to undefined property Model::$last_name
- [ ] Line 237: Access to undefined property Model::$email
- [ ] Line 238: Access to undefined property $member_contact
- [ ] Line 243: Access to undefined property $member_name

## Batch 11: ProjectTeamMember Continued (5 errors)
- [ ] Line 244: Access to undefined property $member_email
- [ ] Line 245: Access to undefined property $member_contact
- [ ] Line 262: Parameter #1 $years expects int, float given
- [ ] Line 262: Parameter #2 $months expects int, float given
- [ ] Line 262: Parameter #3 $days expects int, float given

## Batch 12: ProjectTeamMember Deprecated Parameters (5 errors)
- [ ] Line 135: Parameter #1 $reason implicitly nullable
- [ ] Line 152: Parameter #2 $newResponsibilities implicitly nullable
- [ ] Line 169: Parameter #2 $notes implicitly nullable
- [ ] Line 179: Parameter #1 $email implicitly nullable
- [ ] Line 179: Parameter #2 $contact implicitly nullable

## Batch 13: ProjectTeamMember & ProjectMilestone (5 errors)
- [ ] ProjectTeamMember Line 196: Parameter #2 $preference implicitly nullable
- [ ] ProjectMilestone Line 161: Parameter #1 $notes implicitly nullable
- [ ] ProjectMilestone Line 161: Parameter #2 $qualityScore implicitly nullable
- [ ] ProjectMilestone Line 175: Parameter #1 $reason implicitly nullable
- [ ] ProjectMilestone Line 209: Parameter #2 $team implicitly nullable

## Batch 14: ProjectMilestone Continued (5 errors)
- [ ] Line 217: Parameter #2 $actualCost implicitly nullable
- [ ] Line 225: Parameter #2 $reason implicitly nullable
- [ ] Line 201: Result of && is always false
- [ ] Line 201: Strict comparison using === always evaluates to false
- [ ] Line 323: Access to undefined property Model::$milestones

## Batch 15: ProjectMilestone & Project Model (5 errors)
- [ ] ProjectMilestone Line 334: Call to undefined method Model::updateProgress()
- [ ] Project Line 197: Access to undefined property $category
- [ ] Project Line 201: Parameter #1 $string of str_pad expects string, int given
- [ ] Project Line 220: Access to undefined property $category
- [ ] Project Line 240: Parameter #1 $completionReport implicitly nullable

## Batch 16: Project Model Issues (5 errors)
- [ ] Line 287: Parameter #2 $description implicitly nullable
- [ ] Line 289: Access to undefined property $utilized_budget
- [ ] Line 290: Access to undefined property $allocated_budget
- [ ] Line 312: Parameter #2 $qualityRating implicitly nullable
- [ ] Line 333: Access to undefined property $allocated_budget

## Batch 17: Project Model Continued (5 errors)
- [ ] Line 333: Access to undefined property $utilized_budget
- [ ] Line 339: Access to undefined property $allocated_budget
- [ ] Line 339: Access to undefined property $utilized_budget
- [ ] Line 363: Access to undefined property $title
- [ ] Line 364: Access to undefined property $category

## Batch 18: Project Model Continued (5 errors)
- [ ] Line 366: Access to undefined property $total_budget
- [ ] Line 370: Access to undefined property $actual_end_date
- [ ] Line 372: Access to undefined property $team_size
- [ ] Line 383: Access to undefined property $title
- [ ] Line 384: Access to undefined property $category

## Batch 19: Project Model Final Issues (5 errors)
- [ ] Line 386: Access to undefined property $total_budget
- [ ] Line 390: Access to undefined property $actual_end_date
- [ ] Line 392: Access to undefined property $team_size

## Batch 20: SupabaseStorageService Issues (3 errors)
- [ ] SupabaseStorageService.php Line 19: Property $anonKey is never read
- [ ] SupabaseStorageService.php Line 343: Expression on left side of ?? is not nullable
- [ ] SupabaseStorageService_temp.php Line 19: Property $anonKey is never read

## Batch 21: SupabaseStorageService & Config (2 errors)
- [ ] SupabaseStorageService_temp.php Line 325: Method header() invoked with 2 parameters, 1 required
- [ ] config/database.php Line 10: No error to ignore is reported

## Batch 22: Migration Issues (2 errors)
- [ ] database/migrations/old/2025_06_14_071434_create_users_table.php Line 33: Access to constant ROLES on unknown class
- [ ] database/migrations/old/2025_06_14_071434_create_users_table.php Line 34: Access to constant DEPARTMENTS on unknown class

## Batch 23: PHPStan Configuration (1 error)
- [ ] Ignored error pattern #Call to an undefined method Illuminate\\Database\\Query\\Builder# was not matched

---

## Progress Tracker
- Total Batches: 23
- Completed Batches: 0
- Remaining Errors: 308
