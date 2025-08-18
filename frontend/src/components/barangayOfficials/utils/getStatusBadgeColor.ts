export const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return 'bg-green-100 text-green-800';
      case 'INACTIVE':
        return 'bg-gray-100 text-gray-800';
      case 'SUSPENDED':
        return 'bg-yellow-100 text-yellow-800';
      case 'RESIGNED':
        return 'bg-blue-100 text-blue-800';
      case 'TERMINATED':
        return 'bg-red-100 text-red-800';
      case 'DECEASED':
        return 'bg-black-100 text-black-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };