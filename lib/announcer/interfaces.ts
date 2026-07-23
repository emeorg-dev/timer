export interface IAnnouncementStrategy {
  shouldAnnounce(remaining: number, elapsed: number): boolean
  getAnnouncementText(remaining: number, elapsed: number): string | null
}
