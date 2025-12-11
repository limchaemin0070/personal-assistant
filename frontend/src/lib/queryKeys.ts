export const queryKeys = {
    events: {
        all: ['events'] as const,
        user: () => [...queryKeys.events.all, 'user'] as const,
        byId: (id: number) => [...queryKeys.events.all, id] as const,
        byMonth: (year: number, month: number) =>
            [...queryKeys.events.all, 'month', year, month] as const,
    },
    reminders: {
        all: ['reminders'] as const,
        user: () => [...queryKeys.reminders.all, 'user'] as const,
        byId: (id: number) => [...queryKeys.reminders.all, id] as const,
        byMonth: (year: number, month: number) =>
            [...queryKeys.reminders.all, 'month', year, month] as const,
        byDate: (date: string) =>
            [...queryKeys.reminders.all, 'date', date] as const,
        active: () => [...queryKeys.reminders.all, 'active'] as const,
        completed: () => [...queryKeys.reminders.all, 'completed'] as const,
    },
    alarms: {
        all: ['alarms'] as const,
        user: () => [...queryKeys.alarms.all, 'user'] as const,
    },
} as const;
