import { assert } from 'chai';
import { Request, Response } from 'express';
import sinon from 'sinon';

import { alias } from '../../src/api/middleware/aliases';

describe('alias middleware', () => {
  it('should not replace if no suitable alias', () => {
    const next = sinon.spy();
    const req = { replace: 'not_alias' };

    alias({
      replace: {
        alias: 'value',
      },
    })(req as unknown as Request, {} as Response, next);

    assert(next.calledOnce);
    assert.deepEqual(req, { replace: 'not_alias' });
  });

  it('should not replace empty object aliases', () => {
    const next = sinon.spy();
    const req = { replace: 'alias' };

    alias({})(req as unknown as Request, {} as Response, next);

    assert(next.calledOnce);
    assert.deepEqual(req, { replace: 'alias' });
  });

  it('should not replace null object aliases', () => {
    const next = sinon.spy();
    const req = { replace: 'alias' };

    alias(null)(req as unknown as Request, {} as Response, next);

    assert(next.calledOnce);
    assert.deepEqual(req, { replace: 'alias' });
  });

  it('should replace aliases', () => {
    const next = sinon.spy();
    const req = { replace: 'alias' };

    alias({
      replace: {
        alias: 'value',
      },
    })(req as unknown as Request, {} as Response, next);

    assert(next.calledOnce);
    assert.deepEqual(req, { replace: 'value' });
  });

  it('should replace nested aliases', () => {
    const next = sinon.spy();
    const req = {
      nested: {
        replace: 'alias',
      },
    };

    alias({
      'nested.replace': {
        alias: 'value',
      },
    })(req as unknown as Request, {} as Response, next);

    assert(next.calledOnce);
    assert.deepEqual(req, {
      nested: {
        replace: 'value',
      },
    });
  });

  it('should replace multiple fields', () => {
    const next = sinon.spy();
    const req = {
      replace1: 'alias1',
      replace2: 'alias2',
    };

    alias({
      replace1: {
        alias1: 'value1',
      },
      replace2: {
        alias2: 'value2',
      },
    })(req as unknown as Request, {} as Response, next);

    assert(next.calledOnce);
    assert.deepEqual(req, {
      replace1: 'value1',
      replace2: 'value2',
    });
  });

  it('should replace different aliases', () => {
    const next = sinon.spy();
    const aliasConfig = {
      replace: {
        alias1: 'value1',
        alias2: 'value2',
      },
    };

    const req1 = {
      replace: 'alias1',
    };

    alias(aliasConfig)(req1 as unknown as Request, {} as Response, next);

    assert.deepEqual(req1, {
      replace: 'value1',
    });

    const req2 = {
      replace: 'alias2',
    };

    alias(aliasConfig)(req2 as unknown as Request, {} as Response, next);

    assert.deepEqual(req2, {
      replace: 'value2',
    });
  });
});
