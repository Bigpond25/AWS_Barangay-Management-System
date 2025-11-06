import type { Resident } from "@/services/residents/residents.types";


interface ClearanceSectionProps {
    resident: Resident;
}

export const ClearanceSection: React.FC<ClearanceSectionProps> = ({ resident }) => {
    return (
        <div>
            <h2>On-going Development</h2>
        </div>
    );
}
