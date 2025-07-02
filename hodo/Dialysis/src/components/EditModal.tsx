import React from 'react';
import { Modal, Row, Col } from 'react-bootstrap';
import { Formik, Form as FormikForm } from 'formik';
import { InputField, SelectField, DateField } from './forms';
import ButtonWithGradient from './ButtonWithGradient';
import type { FormConfig, FormField } from './forms/formConfigs';
import '../styles/EditModal.css';

/**
 * Reusable, shareable form modal for editing any data row.
 * Usage:
 * <EditModal
 *   show={show}
 *   onHide={handleClose}
 *   data={rowData}
 *   formConfig={patientFormConfig}
 *   onSubmit={handleSave}
 *   loading={loading}
 *   title="Edit Patient"
 *   submitLabel="Save"
 *   cancelLabel="Cancel"
 *   modalSize="lg"
 * />
 */
interface EditModalProps {
  show: boolean;
  onHide: () => void;
  data: any;
  formConfig: FormConfig;
  onSubmit: (values: any) => Promise<void>;
  onCancel?: () => void;
  loading?: boolean;
  modalSize?: 'sm' | 'lg' | 'xl';
  title?: string;
  submitLabel?: string;
  cancelLabel?: string;
}

const EditModal: React.FC<EditModalProps> = ({
  show,
  onHide,
  data,
  formConfig,
  onSubmit,
  onCancel,
  loading = false,
  modalSize = 'lg',
  title,
  submitLabel = 'Save',
  cancelLabel = 'Cancel',
}) => {
  if (!data) return null;

  const handleSubmit = async (values: any) => {
    await onSubmit(values);
    onHide();
  };

  const renderField = (field: FormField) => {
    const colSize = field.colSize || 6;
    switch (field.type) {
      case 'text':
      case 'email':
      case 'tel':
        return (
          <Col md={colSize} key={field.name}>
            <InputField
              label={field.label}
              name={field.name}
              type={field.type === 'tel' ? 'text' : field.type}
              placeholder={field.placeholder}
              required={field.required}
            />
          </Col>
        );
      case 'date':
        return (
          <Col md={colSize} key={field.name}>
            <DateField
              label={field.label}
              name={field.name}
              required={field.required}
            />
          </Col>
        );
      case 'select':
        return (
          <Col md={colSize} key={field.name}>
            <SelectField
              label={field.label}
              name={field.name}
              options={field.options ?? []}
              required={field.required}
            />
          </Col>
        );
      case 'textarea':
        return (
          <Col md={colSize} key={field.name}>
            <InputField
              label={field.label}
              name={field.name}
              type="text"
              placeholder={field.placeholder}
              required={field.required}
            />
          </Col>
        );
      default:
        return null;
    }
  };

  return (
    <Modal show={show} onHide={onHide} size={modalSize} centered className="edit-modal" aria-modal="true">
      <Modal.Header closeButton>
        <Modal.Title>{title || formConfig.title || 'Edit'}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Formik
          initialValues={formConfig.initialValues(data)}
          validationSchema={formConfig.validationSchema}
          onSubmit={handleSubmit}
          enableReinitialize
        >
          {({ isSubmitting, handleSubmit }) => (
            <FormikForm id="edit-form" onSubmit={handleSubmit}>
              <Row>
                {formConfig.fields.map(renderField)}
              </Row>
              <div className="modal-footer">
                <ButtonWithGradient
                  onClick={onCancel || onHide}
                  className="btn-outline"
                  type="button"
                  aria-label={cancelLabel}
                  disabled={loading}
                >
                  {cancelLabel}
                </ButtonWithGradient>
                <ButtonWithGradient
                  type="submit"
                  processing={loading || isSubmitting}
                  aria-label={submitLabel}
                  disabled={loading || isSubmitting}
                >
                  {submitLabel}
                </ButtonWithGradient>
              </div>
            </FormikForm>
          )}
        </Formik>
      </Modal.Body>
    </Modal>
  );
};

export default EditModal; 