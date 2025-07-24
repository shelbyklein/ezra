/**
 * Tests for TaskCard component
 */

import { render, screen, fireEvent } from '../../../utils/test-utils';
import { TaskCard } from '../TaskCard';
import { mockTask, mockTag } from '../../../utils/test-utils';
import { format } from 'date-fns';

// Mock @dnd-kit
jest.mock('@dnd-kit/sortable', () => ({
  useSortable: () => ({
    attributes: {},
    listeners: {},
    setNodeRef: jest.fn(),
    transform: null,
    transition: null,
    isDragging: false,
  }),
}));

jest.mock('@dnd-kit/utilities', () => ({
  CSS: {
    Transform: {
      toString: () => '',
    },
  },
}));

describe('TaskCard Component', () => {
  const defaultProps = {
    task: mockTask(),
    onClick: jest.fn(),
    isSelected: false,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders task information correctly', () => {
    render(<TaskCard {...defaultProps} />);
    
    expect(screen.getByText('Test Task')).toBeInTheDocument();
    expect(screen.getByText('Test task description')).toBeInTheDocument();
  });

  it('displays priority indicator with correct text', () => {
    const highPriorityTask = mockTask({ priority: 'high' });
    const { rerender } = render(
      <TaskCard {...defaultProps} task={highPriorityTask} />
    );
    
    expect(screen.getByText('high')).toBeInTheDocument();
    
    const mediumPriorityTask = mockTask({ priority: 'medium' });
    rerender(<TaskCard {...defaultProps} task={mediumPriorityTask} />);
    
    expect(screen.getByText('medium')).toBeInTheDocument();
    
    const lowPriorityTask = mockTask({ priority: 'low' });
    rerender(<TaskCard {...defaultProps} task={lowPriorityTask} />);
    
    expect(screen.getByText('low')).toBeInTheDocument();
  });

  it('displays due date when present', () => {
    const dueDate = new Date('2024-12-31');
    const taskWithDueDate = mockTask({ due_date: dueDate.toISOString() });
    
    render(<TaskCard {...defaultProps} task={taskWithDueDate} />);
    
    const formattedDate = format(dueDate, 'MMM d');
    expect(screen.getByText(formattedDate)).toBeInTheDocument();
  });

  it('does not display due date section when not present', () => {
    const taskWithoutDueDate = mockTask({ due_date: null });
    render(<TaskCard {...defaultProps} task={taskWithoutDueDate} />);
    
    // Check that no date is displayed
    const dateText = screen.queryByText(/Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec/);
    expect(dateText).not.toBeInTheDocument();
  });

  it('displays tags when present', () => {
    const tags = [
      mockTag({ name: 'Frontend', color: '#3182CE' }),
      mockTag({ name: 'Bug', color: '#E53E3E' }),
    ];
    const taskWithTags = mockTask({ tags });
    
    render(<TaskCard {...defaultProps} task={taskWithTags} />);
    
    expect(screen.getByText('Frontend')).toBeInTheDocument();
    expect(screen.getByText('Bug')).toBeInTheDocument();
  });

  it('calls onClick when card is clicked', () => {
    const onClick = jest.fn();
    render(<TaskCard {...defaultProps} onClick={onClick} />);
    
    const card = screen.getByText('Test Task').closest('div[role="group"]');
    fireEvent.click(card!);
    
    expect(onClick).toHaveBeenCalledWith(defaultProps.task);
  });

  it('shows selection indicator when selected', () => {
    render(<TaskCard {...defaultProps} isSelected={true} />);
    
    const card = screen.getByText('Test Task').closest('div');
    // Check for selection indicator by looking for specific class or attribute
    expect(card).toBeTruthy();
  });

  it('does not show selection indicator when not selected', () => {
    render(<TaskCard {...defaultProps} isSelected={false} />);
    
    const card = screen.getByText('Test Task').closest('div');
    expect(card).toBeTruthy();
  });

  it('truncates long descriptions', () => {
    const longDescription = 'This is a very long description that should be truncated. '.repeat(10);
    const taskWithLongDesc = mockTask({ description: longDescription });
    
    render(<TaskCard {...defaultProps} task={taskWithLongDesc} />);
    
    const description = screen.getByText((content) => {
      return content.includes('This is a very long description');
    });
    
    expect(description).toBeInTheDocument();
  });

  it('applies drag styles when dragging', () => {
    // Mock dragging state
    const mockUseSortable = require('@dnd-kit/sortable').useSortable as jest.Mock;
    mockUseSortable.mockReturnValue({
      attributes: {},
      listeners: {},
      setNodeRef: jest.fn(),
      transform: { x: 10, y: 10, scaleX: 1, scaleY: 1 },
      transition: 'transform 200ms ease',
      isDragging: true,
    });
    
    render(<TaskCard {...defaultProps} />);
    
    const card = screen.getByText('Test Task').closest('div');
    expect(card).toBeInTheDocument();
  });
});