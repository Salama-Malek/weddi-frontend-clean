import * as React from 'react';
import { render } from '@testing-library/react';
import { useDebouncedCallback } from '../use-debounced-callback';

jest.useFakeTimers();

test('debounced callback executes after delay', () => {
  const fn = jest.fn();

  const TestComponent = () => {
    const callback = useDebouncedCallback(fn, [], 500);
    React.useEffect(() => {
      callback();
    }, [callback]);
    return null;
  };

  render(<TestComponent />);

  expect(fn).not.toBeCalled();
  jest.advanceTimersByTime(500);
  expect(fn).toBeCalledTimes(1);
});
