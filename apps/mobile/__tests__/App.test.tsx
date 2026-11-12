import React from 'react';
import ReactTestRenderer from 'react-test-renderer';
import App from '../src/app/App';

test('renders and shows a time formatted by @medikart/shared', async () => {
  let tree!: ReactTestRenderer.ReactTestRenderer;
  await ReactTestRenderer.act(() => {
    tree = ReactTestRenderer.create(<App />);
  });
  expect(JSON.stringify(tree.toJSON())).toContain('14:30');
});
