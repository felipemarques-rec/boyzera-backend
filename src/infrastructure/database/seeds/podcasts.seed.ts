import { DataSource } from 'typeorm';
import { Podcast, PodcastCategory } from '../../../domain/entities/podcast.entity';

export async function seedPodcasts(dataSource: DataSource) {
  const podcastRepo = dataSource.getRepository(Podcast);

  const existing = await podcastRepo.count();
  if (existing > 0) {
    console.log(`Podcasts already seeded (${existing} found). Skipping.`);
    return;
  }

  const podcasts: Partial<Podcast>[] = [
    {
      title: 'Participar do PodPah',
      description: 'Participe do maior podcast do Brasil e ganhe seguidores!',
      category: PodcastCategory.ENTERTAINMENT,
      hostName: 'Igão e Mítico',
      podcastName: 'PodPah',
      durationMinutes: 15,
      requiredFollowers: BigInt(10000),
      successChance: 90,
      cooldownMinutes: 180,
      followersReward: BigInt(10000),
      followersLoss: BigInt(4000),
      gemsReward: 0,
      engagementChange: 10,
      engagementLoss: 5,
      requiredLevel: 1,
      isActive: true,
      sortOrder: 1,
    },
  ];

  await podcastRepo.save(podcasts);
  console.log(`Seeded ${podcasts.length} podcasts.`);
}
