import vine from '@vinejs/vine';

export const getClustersValidator = vine.compile(
    vine.object({
        minLat: vine.number().range([-90, 90]),
        maxLat: vine.number().range([-90, 90]),
        minLng: vine.number().range([-180, 180]),
        maxLng: vine.number().range([-180, 180]),
        zoom: vine.number().range([0, 22]),
        equipments: vine.array(vine.string().uuid()).optional(),
        company: vine.string().uuid().optional(),
    })
);
