import { HttpStatus, INestApplication, ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';
import * as pactum from 'pactum';
import { AuthDto } from '../src/auth/dto';
import { EditUserDto } from '../src/user/dto';
import { CreateBookmarkDto, EditBookmarkDto } from '../src/bookmark/dto';

describe('App e2e tests', () => {
  let app: INestApplication;
  let prisma: PrismaService;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    app = moduleRef.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
      }),
    );
    await app.init();
    await app.listen(3333);

    prisma = app.get(PrismaService);
    await prisma.cleanDb();

    pactum.request.setBaseUrl('http://localhost:3333');
  }, 10000);

  afterAll(async () => {
    app.close();
  });

  describe('Auth', () => {
    const dto: AuthDto = {
      email: 'test@example.com',
      password: 'password',
    };
    describe('Signup', () => {
      const path = '/auth/signup';
      it('should signup', () => {
        return pactum
          .spec()
          .post(path)
          .withBody(dto)
          .expectStatus(HttpStatus.CREATED)
          .inspect();
      });
      it('should 400 if wrong formatted email', () => {
        return pactum
          .spec()
          .post(path)
          .withBody({
            email: 'wrong formatted email',
            password: dto.password,
          })
          .expectStatus(HttpStatus.BAD_REQUEST);
      });
      it('should 400 if email empty', () => {
        return pactum
          .spec()
          .post(path)
          .withBody({
            passwor: dto.password,
          })
          .expectStatus(HttpStatus.BAD_REQUEST)
          .inspect();
      });
      it('should 400 if password empty', () => {
        return pactum
          .spec()
          .post(path)
          .withBody({
            email: dto.email,
          })
          .expectStatus(HttpStatus.BAD_REQUEST)
          .inspect();
      });
      it('should 400 if body empty', () => {
        return pactum
          .spec()
          .post(path)
          .expectStatus(HttpStatus.BAD_REQUEST)
          .inspect();
      });
    });
    describe('Signin', () => {
      const path = '/auth/signin';
      it('should signin', () => {
        return pactum
          .spec()
          .post(path)
          .withBody(dto)
          .expectStatus(HttpStatus.OK)
          .stores('access_token', 'access_token');
      });
      it('should 400 if wrong formatted email', () => {
        return pactum
          .spec()
          .post(path)
          .withBody({
            email: 'wrong formatted email',
            password: dto.password,
          })
          .expectStatus(HttpStatus.BAD_REQUEST);
      });
      it('should 403 if incorrent email', () => {
        return pactum
          .spec()
          .post(path)
          .withBody({
            email: 'wrong@email.com',
            password: dto.password,
          })
          .expectStatus(HttpStatus.FORBIDDEN);
      });
      it('should 403 if incorrent password', () => {
        return pactum
          .spec()
          .post(path)
          .withBody({
            email: dto.email,
            password: 'wrong password',
          })
          .expectStatus(HttpStatus.FORBIDDEN);
      });
      it('should 400 if email empty', () => {
        return pactum
          .spec()
          .post(path)
          .withBody({
            passwor: dto.password,
          })
          .expectStatus(HttpStatus.BAD_REQUEST)
          .inspect();
      });
      it('should 400 if password empty', () => {
        return pactum
          .spec()
          .post(path)
          .withBody({
            email: dto.email,
          })
          .expectStatus(HttpStatus.BAD_REQUEST)
          .inspect();
      });
      it('should 400 if body empty', () => {
        return pactum
          .spec()
          .post(path)
          .expectStatus(HttpStatus.BAD_REQUEST)
          .inspect();
      });
    });
  });

  describe('User', () => {
    describe('Get me', () => {
      const path = '/users/me';
      it('should get current user', () => {
        return pactum
          .spec()
          .get(path)
          .withHeaders({
            Authorization: 'Bearer $S{access_token}',
          })
          .expectStatus(HttpStatus.OK)
          .inspect();
      });
    });
    describe('Edit user', () => {
      const path = '/users';
      const dto: EditUserDto = {
        firstName: 'newFirstName',
      };
      it('should return user', () => {
        return pactum
          .spec()
          .patch(path)
          .withHeaders({
            Authorization: 'Bearer $S{access_token}',
          })
          .withBody(dto)
          .expectStatus(HttpStatus.OK)
          .expectBodyContains(dto.firstName)
          .inspect();
      });
    });
  });

  describe('Bookmarks', () => {
    describe('Get empty bookmarks', () => {
      const path = '/bookmarks';

      it('should get empty bookmark', () => {
        return pactum
          .spec()
          .get(path)
          .withHeaders({ Authorization: 'Bearer $S{access_token}' })
          .expectStatus(HttpStatus.OK)
          .expectBody([])
          .inspect();
      });
    });

    describe('Create bookmark', () => {
      const path = '/bookmarks';
      const dto: CreateBookmarkDto = {
        title: 'newTitle',
        description: 'newDescription',
        link: 'newLink',
      };
      it('should create a new bookmark', () => {
        return pactum
          .spec()
          .post(path)
          .withHeaders({ Authorization: 'Bearer $S{access_token}' })
          .withBody(dto)
          .expectStatus(HttpStatus.CREATED)
          .stores('bookmarkId', 'id')
          .inspect();
      });
    });

    describe('Get bookmarks', () => {
      const path = '/bookmarks';

      it('should get bookmark', () => {
        return pactum
          .spec()
          .get(path)
          .withHeaders({ Authorization: 'Bearer $S{access_token}' })
          .withPathParams('bookmark-id', '$S{bookmarkId}')
          .expectStatus(HttpStatus.OK)
          .expectJsonLength(1)
          .inspect();
      });
    });

    describe('Get bookmark by id', () => {
      const path = '/bookmarks/{bookmark-id}';

      it('should get non-existent bookmark', () => {
        return pactum
          .spec()
          .get(path)
          .withHeaders({ Authorization: 'Bearer $S{access_token}' })
          .withPathParams('bookmark-id', '0')
          .expectStatus(HttpStatus.OK)
          .inspect();
      });

      it('should get bookmark', () => {
        return pactum
          .spec()
          .get(path)
          .withHeaders({ Authorization: 'Bearer $S{access_token}' })
          .withPathParams('bookmark-id', '$S{bookmarkId}')
          .expectStatus(HttpStatus.OK)
          .expectBodyContains('$S{bookmarkId}')
          .inspect();
      });
    });
    describe('Edit bookmark', () => {
      const path = '/bookmarks/{bookmark-id}';
      const dto: EditBookmarkDto = {
        description: 'new description',
      };
      it('should be able to edit bookmark', () => {
        return pactum
          .spec()
          .patch(path)
          .withHeaders({ Authorization: 'Bearer $S{access_token}' })
          .withPathParams('bookmark-id', '$S{bookmarkId}')
          .withBody(dto)
          .expectStatus(HttpStatus.OK)
          .inspect();
      });
    });
    describe('Delete bookmark', () => {
      it('should be delete bookmark', () => {
        const path = '/bookmarks/{bookmark-id}';
        return pactum
          .spec()
          .delete(path)
          .withHeaders({ Authorization: 'Bearer $S{access_token}' })
          .withPathParams('bookmark-id', '$S{bookmarkId}')
          .expectStatus(HttpStatus.NO_CONTENT)
          .inspect();
      });
    });
  });
});
