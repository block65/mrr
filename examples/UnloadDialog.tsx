import {
  Block,
  Button,
  Form,
  FormInputCheckbox,
  Heading,
  Inline,
  Modal,
  useModal,
} from '@block65/react-design-system';
import { useToggle } from '@block65/react-design-system/hooks';
import { useEffect, type FC } from 'react';
import { useRouterIntercept } from '../index.js';

export const UnloadDialog: FC = () => {
  // const [dialog, dialogClose] = useDialog<'ok' | 'nah' | 'dismiss'>();
  const modal = useModal<
    'can' | 'cannot' // dismiss comes from the RDS Modal component
  >();

  const [canLeave, setCanLeave] = useToggle(false);

  const intercept = useRouterIntercept();
  useEffect(
    () =>
      intercept(async (e, next) => {
        // not allowed, show the modal
        if (!canLeave) {
          // wait for the modal to be closed
          const returnValue = await modal.show();

          // if they cannot leave, prevent the navigation
          if (returnValue !== 'can') {
            e.preventDefault();
          }
        }

        await next();
      }),
    [canLeave, intercept, modal],
  );

  return (
    <Block padding="3">
      <Heading>{canLeave ? 'You are free!' : 'You are trapped!'}</Heading>

      {modal.open && (
        <Modal {...modal} heading="Nav away?">
          <Button
            onClick={() => {
              modal.close('can');
            }}
          >
            can
          </Button>
          <Button onClick={() => modal.close('cannot')}>cannot</Button>
        </Modal>
      )}
      <Inline>
        <Form>
          <FormInputCheckbox
            label={<>Allow the user to leave?</>}
            message="When checked, you can leave the page."
            onChange={(e) => setCanLeave(e.target.checked)}
            checked={canLeave}
          />
        </Form>
      </Inline>
    </Block>
  );
};
