import os from 'os';
import path from 'path';
import fs from 'fs-extra';

import { assert } from 'chai';
import assertRejects from 'assert-rejects';

import { clearCmdStubs, getMock, rtvClient, stubCmd } from '../helpers';

describe('app-pack', () => {
  const rtvTemp = `${os.tmpdir()}/rtv-temp`;
  const inputFile = path.resolve(__dirname, '../mocks/App.zip');
  const outputFile = path.resolve(__dirname, '../../../../.temp/App.wgt');
  const wgtMockFilePath = `${rtvTemp}/builds/TESTABCDEF.App_mock_uid.wgt`;

  it('success pack wgt with default security profile', async () => {
    setupRtvServerStubsForPacking();
    stubCmd(
      `tizen package -t wgt -s Profile -- ${rtvTemp}/mock_uid -o ${rtvTemp}/builds`,
      getMock('tizen24/package_-t_wgt.txt')
    );

    await rtvClient.app.packApp(fs.createReadStream(inputFile), outputFile, {});

    const outputFileContent = fs.readFileSync(outputFile, 'utf8');
    assert.equal(outputFileContent, 'Test wgt file');
  });

  it('empty tizen security profiles list', async () => {
    stubCmd('tizen security-profiles list', getMock('tizen24/security_profiles_list_empty.txt'));

    const promise = rtvClient.app.packApp(fs.createReadStream(inputFile), outputFile, {});

    await assertRejects(promise, /No security profiles available/);
  });

  it('security profile does not have author certificate', async () => {
    setupRtvServerStubsForPacking();
    stubCmd(
      `tizen package -t wgt -s Profile -- ${rtvTemp}/mock_uid -o ${rtvTemp}/builds`,
      getMock('tizen24/package_-t_wgt_no_author_certificate.txt')
    );

    const promise = rtvClient.app.packApp(fs.createReadStream(inputFile), outputFile, {});

    await assertRejects(promise, /Security profile "Profile" does not have author certificate/);

    // Stubs with 'mv' are not executed due to thrown error
    clearCmdStubs('mv');
  });

  it('custom security profile success pack', async () => {
    setupRtvServerStubsForPacking();
    stubCmd(
      `tizen package -t wgt -s Profile2 -- ${rtvTemp}/mock_uid -o ${rtvTemp}/builds`,
      getMock('tizen24/package_-t_wgt.txt')
    );

    await rtvClient.app.packApp(fs.createReadStream(inputFile), outputFile, { tizenSecurityProfile: 'Profile2' });

    const outputFileContent = fs.readFileSync(outputFile, 'utf8');
    assert.equal(outputFileContent, 'Test wgt file');
  });

  it('custom security profile not found', async () => {
    stubCmd('tizen security-profiles list', getMock('tizen24/security_profiles_list.txt'));

    const promise = rtvClient.app.packApp(fs.createReadStream(inputFile), outputFile, {
      tizenSecurityProfile: 'Profile3',
    });

    await assertRejects(promise, /Security profile not found: Profile3\. Available profiles: Profile,Profile2/);
  });

  function setupRtvServerStubsForPacking() {
    stubCmd('tizen security-profiles list', getMock('tizen24/security_profiles_list.txt'));
    stubCmd(`mv '${rtvTemp}/builds/App (test).wgt' '${wgtMockFilePath}'`, '');
    stubCmd(
      `rm -f ${rtvTemp}/mock_uid/.manifest.tmp ${rtvTemp}/mock_uid/author-signature.xml ${rtvTemp}/mock_uid/signature1.xml`,
      ''
    );
    stubCmd(`rm -f ${rtvTemp}/builds/*.wgt`, '');
    fs.writeFileSync(wgtMockFilePath, 'Test wgt file');
  }
});
