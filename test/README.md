# Testing Guide

This directory contains the test suite for docent's installation scripts.

## Running Tests

### Run All Tests

```bash
./test/test-install.sh
```

### Test Coverage

The test suite includes:

**Installer Tests:**

- Help and version commands
- Installing all templates
- Installing specific templates only
- Custom target directory
- Dry-run mode
- Conflict detection and handling
- Force overwrite
- Backup creation

**Uninstaller Tests:**

- Template removal
- Dry-run mode
- Preserving non-template files

**Edge Cases:**

- Missing templates
- Write permission checks

## Manual Testing

For comprehensive testing, also perform manual tests:

1. **Fresh Installation**

   ```bash
   cd /tmp/test-project
   docent/scripts/install.sh
   ```

2. **Update Existing Installation**

   ```bash
   # After initial install
   docent/scripts/install.sh --force
   ```

3. **Selective Installation**

   ```bash
   docent/scripts/install.sh --templates=adr,rfc
   ```

4. **Different Platforms**
   - macOS (primary development platform)
   - Ubuntu Linux
   - Windows WSL

## CI/CD

Tests run automatically on:

- Push to main branch
- Pull requests

See `.github/workflows/test.yml` for CI configuration.

## Adding New Tests

To add a new test:

1. Create a test function in `test-install.sh`:

   ```bash
   test_my_feature() {
     test_start "Description of test"
     setup_test_env

     # Test code here

     if [ condition ]; then
       test_pass
     else
       test_fail "Reason for failure"
     fi

     teardown_test_env
   }
   ```

2. Add the test function call to `run_all_tests()`

3. Run the full test suite to verify

## Test Output

Successful test output:

```
━━━ Test: Description of test
✓ PASS
```

Failed test output:

```
━━━ Test: Description of test
✗ FAIL: Reason for failure
```

## Debugging Failed Tests

If a test fails:

1. Check the test output for the specific failure reason
2. Run the failing test in isolation
3. Check `/tmp/` for leftover test directories
4. Verify templates exist in `templates/` directory
5. Test manually in a clean directory
