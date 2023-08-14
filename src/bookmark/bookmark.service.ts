import { ForbiddenException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateBookmarkDto, EditBookmarkDto } from './dto';

@Injectable()
export class BookmarkService {
  constructor(private prisma: PrismaService) {}

  createBookmark(userId: number, dto: CreateBookmarkDto) {
    return this.prisma.bookmark.create({
      data: { userId, ...dto },
    });
  }
  deleteBookmarkById(userId: number, bookmarkId: number) {
    this.checkBookmarkUserId(userId, bookmarkId);
    return this.prisma.bookmark.delete({
      where: { userId: userId, id: bookmarkId },
    });
  }
  editBookmarkById(userId: number, bookmarkId: number, dto: EditBookmarkDto) {
    this.checkBookmarkUserId(userId, bookmarkId);
    return this.prisma.bookmark.update({
      where: { userId: userId, id: bookmarkId },
      data: { ...dto },
    });
  }
  getBookmarkById(userId: number, bookmarkId: number) {
    this.checkBookmarkUserId(userId, bookmarkId);
    return this.prisma.bookmark.findUnique({
      where: { userId: userId, id: bookmarkId },
    });
  }
  getBookmarks(userId: number) {
    return this.prisma.bookmark.findMany({
      where: { userId: userId },
    });
  }

  async checkBookmarkUserId(userId: number, bookmarkId: number) {
    const bookmark = await this.prisma.bookmark.findUnique({
      where: { id: bookmarkId },
    });
    if (bookmark && bookmark.userId !== userId) {
      throw new ForbiddenException('Forbidden access to bookmark');
    }
    return bookmark;
  }
}
