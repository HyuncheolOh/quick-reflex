import React from 'react';
import {
  Modal as RNModal,
  View,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  Text,
} from 'react-native';
import { SPACING, TYPOGRAPHY, BORDER_RADIUS } from '../../constants';
import { Button } from './Button';
import { useThemedColors } from '../../hooks';
import { useLocalization } from '../../contexts';

const { width, height } = Dimensions.get('window');

interface ModalProps {
  visible: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  showCloseButton?: boolean;
  animationType?: 'slide' | 'fade' | 'none';
}

export const Modal: React.FC<ModalProps> = ({
  visible,
  onClose,
  title,
  children,
  showCloseButton = true,
  animationType = 'fade',
}) => {
  const colors = useThemedColors();
  return (
    <RNModal
      visible={visible}
      transparent
      animationType={animationType}
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <TouchableOpacity
          style={styles.backdrop}
          activeOpacity={1}
          onPress={onClose}
        />
        
        <View style={[styles.container, { backgroundColor: colors.SURFACE }]}>
          {title && (
            <View style={[styles.header, { borderBottomColor: colors.TEXT_TERTIARY }]}>
              <Text style={[styles.title, { color: colors.TEXT_PRIMARY }]}>{title}</Text>
              {showCloseButton && (
                <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                  <Text style={[styles.closeButtonText, { color: colors.TEXT_SECONDARY }]}>✕</Text>
                </TouchableOpacity>
              )}
            </View>
          )}
          
          <View style={styles.content}>
            {children}
          </View>
        </View>
      </View>
    </RNModal>
  );
};

export const ConfirmModal: React.FC<{
  visible: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'danger' | 'primary';
}> = ({
  visible,
  onClose,
  onConfirm,
  title,
  message,
  confirmText,
  cancelText,
  variant = 'primary',
}) => {
  const colors = useThemedColors();
  const { t } = useLocalization();
  
  const finalConfirmText = confirmText || t.modals.confirmModal.confirm;
  const finalCancelText = cancelText || t.modals.confirmModal.cancel;
  return (
    <Modal visible={visible} onClose={onClose} title={title} showCloseButton={false}>
      <Text style={[styles.message, { color: colors.TEXT_PRIMARY }]}>{message}</Text>
      
      <View style={styles.buttonContainer}>
        <Button
          title={finalCancelText}
          onPress={onClose}
          variant="ghost"
          style={styles.button}
        />
        <Button
          title={finalConfirmText}
          onPress={() => {
            onConfirm();
            onClose();
          }}
          variant={variant === 'danger' ? 'danger' : 'primary'}
          style={styles.button}
        />
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  backdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  
  container: {
    borderRadius: BORDER_RADIUS.XL,
    maxWidth: width - SPACING.XL * 2,
    maxHeight: height - SPACING.XXL * 2,
    minWidth: 280,
  },
  
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.LG,
    paddingTop: SPACING.LG,
    paddingBottom: SPACING.MD,
    borderBottomWidth: 1,
  },
  
  title: {
    fontSize: TYPOGRAPHY.FONT_SIZE.LG,
    fontWeight: TYPOGRAPHY.FONT_WEIGHT.BOLD,
    flex: 1,
  },
  
  closeButton: {
    padding: SPACING.SM,
    marginLeft: SPACING.MD,
  },
  
  closeButtonText: {
    fontSize: TYPOGRAPHY.FONT_SIZE.LG,
  },
  
  content: {
    padding: SPACING.LG,
  },
  
  message: {
    fontSize: TYPOGRAPHY.FONT_SIZE.MD,
    textAlign: 'center',
    marginBottom: SPACING.LG,
    lineHeight: 22,
  },
  
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: SPACING.MD,
  },
  
  button: {
    flex: 1,
  },
});