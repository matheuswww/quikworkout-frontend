import { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
    return [
        {
            url: 'https://quikworkout.com.br',
            priority: 1
        },
    ];
}