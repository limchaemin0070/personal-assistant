export const queryKeys = {
    events: {
        all: ['events'] as const,
        user: () => [...queryKeys.events.all, 'user'] as const,
        byMonth: (year: number, month: number) =>
            [...queryKeys.events.all, 'month', year, month] as const,
        byId: (id: number) => [...queryKeys.events.all, id] as const,
    },
    reminders: {
        all: ['reminders'] as const,
        user: () => [...queryKeys.reminders.all, 'user'] as const,
    },
    alarms: {
        all: ['alarms'] as const,
        user: () => [...queryKeys.alarms.all, 'user'] as const,
    },
} as const;
