/* eslint-disable @typescript-eslint/no-unsafe-argument */
import { RolesGuard } from './role.guard';

describe('RoleGuard', () => {
  it('should be defined', () => {
    expect(new RolesGuard(null as any)).toBeDefined();
  });
});
