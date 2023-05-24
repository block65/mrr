import {
  Block,
  Button,
  Dialog,
  Form,
  FormInputCheckbox,
  Heading,
  Modal,
  useDialog,
  useModal,
} from '@block65/react-design-system';
import { useToggle } from '@block65/react-design-system/hooks';
import { useEffect, type FC } from 'react';
import { useRouter } from '../index.js';

export const UnloadDialog: FC = () => {
  const [dialog, dialogClose] = useDialog<'ok' | 'nah' | 'dismiss'>();
  const [modal] = useModal<'can' | 'cannot' | 'dismiss'>();

  const [canLeave, setCanLeave] = useToggle(false);
  const [, dispatch] = useRouter();

  useEffect(() => {
    dispatch({
      hook: async (e) => {
        if (!canLeave) {
          dialog.show();
        }

        const returnValue = await dialogClose();
        if (returnValue === 'nah') {
          e.preventDefault();
          dialog.close(returnValue);
        }
      },
    });
  }, [canLeave, dialog, dialogClose, dispatch]);

  return (
    <Block padding="3">
      <Heading>{canLeave ? 'You are free!' : 'You are trapped!'}</Heading>
      <Dialog {...dialog} heading="Nav away?">
        <Button
          onClick={() => {
            dialog.close('ok');
          }}
        >
          OK
        </Button>
        <Button variant="ghost" onClick={() => dialog.close('nah')}>
          Nah
        </Button>
      </Dialog>

      {modal.open && (
        <Modal {...modal} heading="Nav away?">
          <Button
            onClick={() => {
              setCanLeave(true);
              modal.close('can');
            }}
          >
            OK
          </Button>
          <Button variant="ghost" onClick={() => modal.close('cannot')}>
            Nah
          </Button>
        </Modal>
      )}
      <Form>
        <FormInputCheckbox
          label={<>Allow the user to leave?</>}
          message="When checked, you can leave the page."
          onChange={(e) => setCanLeave(e.target.checked)}
          checked={canLeave}
        />
      </Form>
    </Block>
  );
};
