import { Test, TestingModule } from '@nestjs/testing';
import { AtivoService } from './ativo.service';

describe('AtivoService', () => {
  let service: AtivoService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AtivoService],
    }).compile();

    service = module.get<AtivoService>(AtivoService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
