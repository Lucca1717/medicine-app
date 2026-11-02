import { filterCurrentUserMedications, filterCurrentUserPeriods } from './schedule-page.component';

describe('schedule select filtering', () => {
  it('keeps only periods belonging to the current user', () => {
    const periods = [
      { id: 'morning', userId: 'user-1', name: 'Morning', time: '08:00:00' },
      { id: 'other', userId: 'user-2', name: 'Morning', time: '08:00:00' },
    ];

    expect(filterCurrentUserPeriods(periods, 'user-1')).toEqual([periods[0]]);
  });

  it('keeps only user medications belonging to the current user', () => {
    const medications = [
      {
        id: 'medication-1',
        userId: 'user-1',
        medicationId: 'dipyrone',
        currentStockValue: 10,
        stockUnitId: 'tablet',
        startDate: '2026-01-01',
        endDate: null,
        active: true,
      },
      {
        id: 'medication-2',
        userId: 'user-2',
        medicationId: 'dipyrone',
        currentStockValue: 10,
        stockUnitId: 'tablet',
        startDate: '2026-01-01',
        endDate: null,
        active: true,
      },
    ];

    expect(filterCurrentUserMedications(medications, 'user-1')).toEqual([medications[0]]);
  });
});
