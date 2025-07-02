# E2E Tests

## Test Organization

### Active Tests (基本功能测试)
- `basic.spec.ts` - Basic Electron app launch and UI structure
- `basic-launch.spec.ts` - UI elements verification  
- `simple-startup.spec.ts` - App initialization and input handling
- `simple-interaction.spec.ts` - Basic AI interaction

### Disabled Tests (暂时禁用的复杂测试)
Located in `disabled/` folder:
- Adaptive card tests
- Chess game specific tests
- Complex interaction tests

## Testing Strategy

1. **Start Simple**: Focus on basic functionality first
2. **Ensure Stability**: Make sure basic tests pass consistently
3. **Gradual Complexity**: Add more complex tests one by one

## Running Tests

```bash
# Run all active tests
npm test

# Run specific test
npm test -- basic.spec.ts

# Run tests in headed mode (see browser)
npm test -- --headed

# Run with debugging
PWDEBUG=1 npm test
```

## Adding New Tests

1. Create new test file in `tests/` folder
2. Start with simple assertions
3. Test one feature at a time
4. Move to `disabled/` if test is unstable

## Re-enabling Disabled Tests

To re-enable a test:
```bash
mv disabled/test-name.spec.ts ./
```

Then fix any issues and ensure it passes consistently.