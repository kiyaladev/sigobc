import { defineBoot } from '#q-app/wrappers';
import { initSyncService } from 'src/database/sync';

export default defineBoot(() => {
  initSyncService();
});
