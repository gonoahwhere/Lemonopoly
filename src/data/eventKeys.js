export const EVENT_DETAILS = [
    {
        name: 'Heatwave',
        id: 'heatwave',
        type: 'beneficial',
        options: [
            {
                task: 'increase in ingredient consumption per mix',
                id: 'heatwave_one',
            },
            {
                task: 'reduced sell cooldown',
                id: 'heatwave_two',
            },
            {
                task: 'temporary tip chance bonus on each sale',
                id: 'heatwave_three',
            },
            {
                task: 'chance on a bonus sale with no cooldown',
                id: 'heatwave_four',
            },
            {
                task: 'increased chance of tourist customers appearing',
                id: 'heatwave_five',
            },
            {
                task: 'increased chance of kid customers appearing',
                id: 'heatwave_six',
            },
            {
                task: 'reduced chance of angry customers appearing',
                id: 'heatwave_seven',
            },
            {
                task: 'slightly higher ingredient restock cost',
                id: 'heatwave_eight',
            },
            {
                task: 'temporary increase to drink sell price',
                id: 'heatwave_nine',
            },
            {
                task: 'guaranteed tourist customer on first sale',
                id: 'heatwave_ten',
            },
            {
                task: 'increased chance of worker customers appearing',
                id: 'heatwave_eleven',
            },
            {
                task: 'increased chance of rich customers appearing',
                id: 'heatwave_twelve',
            },
        ]
    },
    {
        name: 'Local Festival',
        id: 'local_festival',
        type: 'beneficial',
        options: [
            {
                task: 'reduced sell cooldown',
                id: 'local_festival_one',
            },
            {
                task: 'temporary tip chance bonus on each sale',
                id: 'local_festival_two',
            },
            {
                task: 'chance of a bonus sale with no cooldown',
                id: 'local_festival_three',
            },
            {
                task: 'increased chance of tourist customers appearing',
                id: 'local_festival_four',
            },
            {
                task: 'increased chance of rich customers appearing',
                id: 'local_festival_five',
            },
            {
                task: 'increased chance of kid customers appearing',
                id: 'local_festival_six',
            },
            {
                task: 'reduced chance of angry customers appearing',
                id: 'local_festival_seven',
            },
            {
                task: 'sharply reduced sell cooldown (rare)',
                id: 'local_festival_eight',
            },
            {
                task: 'temporary discount on ingredients',
                id: 'local_festival_nine',
            },
            {
                task: 'bonus tip chance stacking on bulk orders',
                id: 'local_festival_ten',
            },
            {
                task: 'increased chance of worker customers appearing',
                id: 'local_festival_eleven',
            },

        ]
    },
    {
        name: 'Sudden Rain',
        id: 'sudden_rain',
        type: 'risky',
        options: [
            {
                task: 'increased sell cooldown',
                id: 'sudden_rain_one',
            },
            {
                task: 'discount on ingredients',
                id: 'sudden_rain_two',
            },
            {
                task: 'reduced ingredient consumption per mix',
                id: 'sudden_rain_three',
            },
            {
                task: 'chance of a sell tick producing no sale',
                id: 'sudden_rain_four',
            },
            {
                task: 'temporary reduction to tip amount',
                id: 'sudden_rain_five',
            },
            {
                task: 'increased chance of angry customers appearing',
                id: 'sudden_rain_six',
            },
            {
                task: 'reduced chance of tourist customers appearing',
                id: 'sudden_rain_seven',
            },
            {
                task: 'reduced chance of rich customers appearing',
                id: 'sudden_rain_eight',
            },
            {
                task: 'reduced chance of kid customers appearing',
                id: 'sudden_rain_nine',
            },
            {
                task: 'chance of a discounted bonus sale',
                id: 'sudden_rain_ten',
            },
            {
                task: 'reduced chance of worker customers appearing',
                id: 'sudden_rain_eleven',
            },
        ]
    },
    {
        name: 'Thunderstorm',
        id: 'thunderstorm',
        type: 'harmful',
        options: [
            {
                task: 'chance of stand taking damage',
                id: 'thunderstorm_one',
            },
            {
                task: 'sharply increased sell cooldown',
                id: 'thunderstorm_two',
            },
            {
                task: 'chance of ingredient stock loss from the storm',
                id: 'thunderstorm_three',
            },
            {
                task: 'increased chance of a sell tick failing entirely',
                id: 'thunderstorm_four',
            },
            {
                task: 'temporary drop in tip amount',
                id: 'thunderstorm_five',
            },
            {
                task: 'increased chance of angry customers appearing',
                id: 'thunderstorm_six',
            },
            {
                task: 'reduced chance of tourist customers appearing',
                id: 'thunderstorm_seven',
            },
            {
                task: 'reduced chance of rich customers appearing',
                id: 'thunderstorm_eight',
            },
            {
                task: 'reduced chance of kid customers appearing',
                id: 'thunderstorm_nine',
            },
            {
                task: 'chance of drink stock loss from the storm',
                id: 'thunderstorm_ten',
            },
            {
                task: 'no chance of worker customers appearing',
                id: 'thunderstorm_eleven',
            },
        ]
    },
    {
        name: 'Wind Storm',
        id: 'wind_storm',
        type: 'harmful',
        options: [
            {
                task: 'chance of ingredient stock loss from the storm',
                id: 'wind_storm_one',
            },
            {
                task: 'chance of drink stock loss from the storm',
                id: 'wind_storm_two',
            },
            {
                task: 'minor chance of stand taking damage',
                id: 'wind_storm_three',
            },
            {
                task: 'increased sell cooldown',
                id: 'wind_storm_four',
            },
            {
                task: 'chance of a sell tick producing no sale',
                id: 'wind_storm_five',
            },
            {
                task: 'temporary drop in tip amount',
                id: 'wind_storm_six',
            },
            {
                task: 'increased chance of angry customers appearing',
                id: 'wind_storm_seven',
            },
            {
                task: 'reduced chance of rich customers appearing',
                id: 'wind_storm_eight',
            },
            {
                task: 'reduced chance of tourist customers appearing',
                id: 'wind_storm_nine',
            },
            {
                task: 'reduced chance of kid customers appearing',
                id: 'wind_storm_ten',
            },
            {
                task: 'no chance of worker customers appearing',
                id: 'wind_storm_eleven',
            },
        ]
    },
];

export const EVENT_CUSTOMERS = [
    {
        name: 'Tourist',
        id: 'tourist',
        job: 'pays more money per drink',
        
    },
    {
        name: 'Kid',
        id: 'kid',
        job: 'prefers the fruit flavours',
    },
    {
        name: 'Worker',
        id: 'worker',
        job: 'visits during the first 5 minutes',
    },
    {
        name: 'Rich',
        id: 'rich',
        job: 'chooses the more expensive drinks',
    },
    {
        name: 'Angry',
        id: 'angry',
        job: 'chooses the cheaper drinks'
    }
]