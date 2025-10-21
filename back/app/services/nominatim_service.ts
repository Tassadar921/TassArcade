import axios from 'axios';
import env from '#start/env';

export default class NominatimService {
    public async getFromAddress(address: string): Promise<any> {
        try {
            const url: string = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(address)}&format=json&limit=1`;

            const response = await axios.get(url, {
                headers: {
                    'User-Agent': `TassArcade/${env.get('APP_VERSION')} (${env.get('ADMIN_EMAIL')})`,
                },
            });

            return { latitude: response.data[0].lat, longitude: response.data[0].lon };
        } catch {
            return null;
        }
    }
}
