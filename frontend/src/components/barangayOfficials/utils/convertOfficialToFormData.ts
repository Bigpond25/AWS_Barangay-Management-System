import type { BarangayOfficial, BarangayOfficialFormData } from "../../../services/officials/barangayOfficials.types";

// Transform API data to form data format
export const convertOfficialToFormData = (official: BarangayOfficial): BarangayOfficialFormData => ({
    resident_search: '',
    resident_id: official.resident_id || '',
    prefix: official.prefix || 'Mr.',
    first_name: official.first_name,
    middle_name: official.middle_name || '',
    last_name: official.last_name,
    suffix: official.suffix || '',
    birth_date: official.birth_date || '',
    gender: official.gender || 'MALE',
    nationality: official.nationality || 'FILIPINO',
    civil_status: official.civil_status || 'SINGLE',
    educational_attainment: official.educational_attainment || 'NO_FORMAL_EDUCATION',
    mobile_number: official.mobile_number || official.contact_number || '',
    email_address: official.email_address || '',
    complete_address: official.complete_address || official.address || '',
    position: official.position,
    committee_assignment: (official.committee_assignment || official.committee || 'Health') as 'Health' | 'Education' | 'Public Safety' | 'Environment' | 'Peace and Order' | 'Sports and Recreation' | 'Women and Family' | 'Senior Citizens',
    term_start: official.term_start || '',
    term_end: official.term_end || '',
    term_number: official.term_number || 0,
    is_current_term: official.is_current_term || false,
    status: official.status || 'ACTIVE',
    profile_photo_url: official.profile_photo_url || official.profile_photo || ''
});