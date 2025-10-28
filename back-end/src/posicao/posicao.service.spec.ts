import { Test, TestingModule } from '@nestjs/testing';
import { PosicaoService } from './posicao.service';

describe('PosicaoService', () => {
  let service: PosicaoService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PosicaoService],
    }).compile();

    service = module.get<PosicaoService>(PosicaoService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
