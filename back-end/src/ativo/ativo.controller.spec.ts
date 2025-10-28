import { Test, TestingModule } from '@nestjs/testing';
import { AtivoController } from './ativo.controller';
import { AtivoService } from './ativo.service';

describe('AtivoController', () => {
  let controller: AtivoController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AtivoController],
      providers: [AtivoService],
    }).compile();

    controller = module.get<AtivoController>(AtivoController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
