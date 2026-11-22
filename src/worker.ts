// Worker entry point, as https://docs.emdashcms.com/deployment/cloudflare/#add-the-worker-entry-point
// shows. The spread handler runs Astro and forwards co-editing connections to
// their rooms; `scheduled` runs EmDash's Cron work (wrangler.jsonc `triggers`).
import handler, {
  createScheduledHandler,
  EmDashRoom,
  EmDashRoomSite,
  PluginBridge,
} from '@emdash-cms/cloudflare/worker';

export { EmDashRoom, EmDashRoomSite, PluginBridge };

export default {
  ...handler,
  scheduled: createScheduledHandler(),
} satisfies ExportedHandler;
