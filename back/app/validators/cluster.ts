import vine from '@vinejs/vine';

export const getClustersValidator = vine.compile(
    vine.object({
        minLat: vine.number().range([-90, 90]),
        maxLat: vine.number().range([-90, 90]),
        minLon: vine.number().range([-180, 180]),
        maxLon: vine.number().range([-180, 180]),
        zoom: vine.number().range([0, 22]),
    })
);
