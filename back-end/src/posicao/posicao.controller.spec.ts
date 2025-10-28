import { Test, TestingModule } from '@nestjs/testing';
import { PosicaoController } from './posicao.controller';
import { PosicaoService } from './posicao.service';

describe('PosicaoController', () => {
  let controller: PosicaoController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PosicaoController],
      providers: [PosicaoService],
    }).compile();

    controller = module.get<PosicaoController>(PosicaoController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
