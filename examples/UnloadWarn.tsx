import { Button, Form, FormInput, Heading } from '@block65/react-design-system';
import { useState, type FC } from 'react';
import { usePreventUnload } from '../index.js';

export const UnloadWarn: FC = () => {
  const defaultValue = 'delicious';
  const [value, setValue] = useState(defaultValue);

  const preventUnload = value !== defaultValue;

  usePreventUnload(preventUnload);

  return (
    <>
      <Form>
        <Heading>Unload me</Heading>
        <FormInput
          name="taste"
          value={value}
          label="How was it?"
          placeholder="delicious"
          autoFocus
          message={preventUnload ? 'preventNav' : 'allowNav'}
          onChange={(e) => setValue(e.currentTarget.value)}
        />
        <Button type="submit">Submit</Button>
      </Form>
    </>
  );
};
