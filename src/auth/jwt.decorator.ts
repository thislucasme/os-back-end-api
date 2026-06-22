import { SetMetadata } from '@nestjs/common';

export const REQUIRE_AUTH = Symbol('REQUIRE_AUTH');

export const Auth = () => SetMetadata(REQUIRE_AUTH, true);
