import type { Core } from '@strapi/strapi';

const PUBLIC_READ_CONTENT_TYPES = [
  'api::event.event',
  'api::webinar.webinar',
  'api::conference-video.conference-video',
  'api::article.article',
  'api::newsletter.newsletter',
  'api::board.board',
];

export default {
  register(/* { strapi }: { strapi: Core.Strapi } */) {},

  async bootstrap({ strapi }: { strapi: Core.Strapi }) {
    const publicRole = await strapi
      .query('plugin::users-permissions.role')
      .findOne({ where: { type: 'public' } });

    if (!publicRole) return;

    for (const uid of PUBLIC_READ_CONTENT_TYPES) {
      for (const action of ['find', 'findOne']) {
        const fullAction = `${uid}.${action}`;
        const existing = await strapi
          .query('plugin::users-permissions.permission')
          .findOne({ where: { action: fullAction, role: publicRole.id } });

        if (!existing) {
          await strapi.query('plugin::users-permissions.permission').create({
            data: { action: fullAction, role: publicRole.id },
          });
        }
      }
    }
  },
};
