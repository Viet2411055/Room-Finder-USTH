import { presentListing } from '../rooms/room.presenter.js';
import { wishlistRepository as repo } from './wishlist.repository.js';
export async function list(userId: string) { return (await repo.list(userId)).map(item => presentListing(item.listing)); }
export async function status(userId: string, listingId: string) { return { saved: (await repo.count(userId, listingId)) > 0 }; }
export async function add(userId: string, listingId: string) { await repo.add(userId, listingId); }
export async function remove(userId: string, listingId: string) { await repo.remove(userId, listingId); }
