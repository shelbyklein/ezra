/**
 * Backup and import settings component
 */

import React, { useState, useRef } from 'react';
import {
  VStack,
  HStack,
  Box,
  Button,
  Text,
  useToast,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  useDisclosure,
  List,
  ListItem,
  ListIcon,
  Spinner,
  Icon,
  Heading,
  Input,
  Divider,
} from '@chakra-ui/react';
import { 
  FaDownload, 
  FaUpload, 
  FaCheckCircle, 
  FaExclamationCircle,
  FaDatabase,
  FaFile,
  FaCalendar,
} from 'react-icons/fa';
import { api } from '../../services/api';
import { format } from 'date-fns';

interface ImportPreview {
  valid: boolean;
  version?: string;
  exportDate?: string;
  summary?: {
    projects: number;
    tasks: number;
    notebooks: number;
    folders: number;
    pages: number;
    blocks: number;
    tags: number;
    attachments: number;
  };
  error?: string;
}

export const BackupSettings: React.FC = () => {
  const toast = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [importData, setImportData] = useState<any>(null);
  const [importPreview, setImportPreview] = useState<ImportPreview | null>(null);
  const { isOpen, onOpen, onClose } = useDisclosure();

  const handleExport = async () => {
    setIsExporting(true);
    try {
      const response = await api.get('/backup/export', {
        responseType: 'blob',
      });
      
      // Create download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute(
        'download',
        `ezra-backup-${format(new Date(), 'yyyy-MM-dd')}.json`
      );
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      toast({
        title: 'Export successful',
        description: 'Your data has been exported successfully',
        status: 'success',
        duration: 3000,
      });
    } catch (error) {
      console.error('Export error:', error);
      toast({
        title: 'Export failed',
        description: 'Failed to export your data',
        status: 'error',
        duration: 5000,
      });
    } finally {
      setIsExporting(false);
    }
  };

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const text = await file.text();
      const data = JSON.parse(text);
      
      // Preview the import
      const response = await api.post('/backup/import/preview', data);
      setImportData(data);
      setImportPreview(response.data);
      onOpen();
    } catch (error) {
      console.error('File read error:', error);
      toast({
        title: 'Invalid file',
        description: 'The selected file is not a valid backup file',
        status: 'error',
        duration: 5000,
      });
    }
    
    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleImport = async () => {
    if (!importData) return;

    setIsImporting(true);
    try {
      const response = await api.post('/backup/import', importData);
      
      toast({
        title: 'Import successful',
        description: `Imported ${response.data.imported.projects} projects, ${response.data.imported.tasks} tasks, and more`,
        status: 'success',
        duration: 5000,
      });
      
      onClose();
      setImportData(null);
      setImportPreview(null);
      
      // Reload the page to show imported data
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    } catch (error: any) {
      console.error('Import error:', error);
      toast({
        title: 'Import failed',
        description: error.response?.data?.error || 'Failed to import data',
        status: 'error',
        duration: 5000,
      });
    } finally {
      setIsImporting(false);
    }
  };

  const handleModalClose = () => {
    onClose();
    setImportData(null);
    setImportPreview(null);
  };

  return (
    <VStack id="backup-settings" className="backup-settings-section" align="stretch" spacing={6}>
      <Box>
        <Heading size="md" mb={4}>Data Backup & Import</Heading>
        
        {/* Export Section */}
        <Box
          p={6}
          borderWidth={1}
          borderRadius="md"
          borderColor="border.primary"
          mb={4}
        >
          <VStack align="stretch" spacing={4}>
            <HStack>
              <Icon as={FaDownload} color="blue.500" boxSize={5} />
              <Heading size="sm">Export Data</Heading>
            </HStack>
            
            <Text color="text.secondary">
              Download all your projects, tasks, notebooks, and settings as a JSON file.
              This backup includes all your data and can be used to restore your workspace
              or transfer it to another account.
            </Text>
            
            <Button
              id="export-data-button"
              leftIcon={<FaDownload />}
              colorScheme="blue"
              onClick={handleExport}
              isLoading={isExporting}
              loadingText="Exporting..."
            >
              Export All Data
            </Button>
          </VStack>
        </Box>

        {/* Import Section */}
        <Box
          p={6}
          borderWidth={1}
          borderRadius="md"
          borderColor="border.primary"
        >
          <VStack align="stretch" spacing={4}>
            <HStack>
              <Icon as={FaUpload} color="green.500" boxSize={5} />
              <Heading size="sm">Import Data</Heading>
            </HStack>
            
            <Text color="text.secondary">
              Import data from a previously exported backup file. This will add the
              imported data to your existing workspace without removing current data.
            </Text>
            
            <Alert status="warning" borderRadius="md">
              <AlertIcon />
              <Box>
                <AlertTitle>Important</AlertTitle>
                <AlertDescription>
                  Importing data will not delete or overwrite your existing data.
                  All imported items will be added as new entries.
                </AlertDescription>
              </Box>
            </Alert>
            
            <Input
              ref={fileInputRef}
              id="import-file-input"
              type="file"
              accept=".json"
              onChange={handleFileSelect}
              display="none"
            />
            
            <Button
              id="import-data-button"
              leftIcon={<FaUpload />}
              colorScheme="green"
              onClick={() => fileInputRef.current?.click()}
            >
              Select Import File
            </Button>
          </VStack>
        </Box>
      </Box>

      {/* Import Preview Modal */}
      <Modal 
        id="import-preview-modal"
        isOpen={isOpen} 
        onClose={handleModalClose} 
        size="lg"
      >
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Import Preview</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            {importPreview?.valid ? (
              <VStack align="stretch" spacing={4}>
                <Alert status="success" borderRadius="md">
                  <AlertIcon />
                  <Text>Valid backup file detected</Text>
                </Alert>
                
                <Box>
                  <HStack mb={2}>
                    <Icon as={FaFile} />
                    <Text fontWeight="semibold">File Information</Text>
                  </HStack>
                  <VStack align="stretch" pl={8} spacing={1}>
                    <Text fontSize="sm">
                      Version: {importPreview.version}
                    </Text>
                    <Text fontSize="sm">
                      Export Date: {importPreview.exportDate && 
                        format(new Date(importPreview.exportDate), 'PPP')}
                    </Text>
                  </VStack>
                </Box>
                
                <Divider />
                
                <Box>
                  <HStack mb={2}>
                    <Icon as={FaDatabase} />
                    <Text fontWeight="semibold">Data to Import</Text>
                  </HStack>
                  <List spacing={2} pl={8}>
                    {importPreview.summary && Object.entries(importPreview.summary).map(([key, value]) => (
                      <ListItem key={key} fontSize="sm">
                        <ListIcon as={FaCheckCircle} color="green.500" />
                        {value} {key.charAt(0).toUpperCase() + key.slice(1)}
                      </ListItem>
                    ))}
                  </List>
                </Box>
              </VStack>
            ) : (
              <Alert status="error" borderRadius="md">
                <AlertIcon />
                <Box>
                  <AlertTitle>Invalid Import File</AlertTitle>
                  <AlertDescription>
                    {importPreview?.error || 'The selected file is not a valid backup file.'}
                  </AlertDescription>
                </Box>
              </Alert>
            )}
          </ModalBody>

          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={handleModalClose}>
              Cancel
            </Button>
            <Button
              colorScheme="green"
              onClick={handleImport}
              isLoading={isImporting}
              loadingText="Importing..."
              isDisabled={!importPreview?.valid}
            >
              Import Data
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </VStack>
  );
};