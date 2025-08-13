import React from "react";
import Card from "@/components/atoms/Card";
import Button from "@/components/atoms/Button";
import ApperIcon from "@/components/ApperIcon";

const QuestionCard = ({ question, onEdit, onDelete, onDuplicate }) => {
  const getTypeIcon = (type) => {
    switch (type) {
      case "boolean": return "ToggleLeft";
      case "likert": return "BarChart3";
      case "multiple": return "CheckSquare";
      default: return "HelpCircle";
    }
  };

  const getTypeName = (type) => {
    switch (type) {
      case "boolean": return "Yes/No/Maybe";
      case "likert": return "Likert Scale";
      case "multiple": return "Multiple Choice";
      default: return "Unknown";
    }
  };

  return (
    <Card hover className="p-4">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center space-x-3 flex-1">
          <div className="drag-handle p-1 text-gray-400 hover:text-gray-600">
            <ApperIcon name="GripVertical" size={20} />
          </div>
          <div className="flex-1">
            <h4 className="font-medium text-gray-900 mb-1">{question.text}</h4>
            <div className="flex items-center space-x-4 text-sm text-gray-500">
              <div className="flex items-center space-x-1">
                <ApperIcon name={getTypeIcon(question.type)} size={16} />
                <span>{getTypeName(question.type)}</span>
              </div>
              <div className="flex items-center space-x-1">
                <ApperIcon name="Weight" size={16} />
                <span>Weight: {question.weight}x</span>
              </div>
            </div>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <Button
            variant="ghost"
            size="sm"
            icon="Copy"
            onClick={() => onDuplicate(question.Id)}
          />
          <Button
            variant="ghost"
            size="sm"
            icon="Edit2"
            onClick={() => onEdit(question.Id)}
          />
          <Button
            variant="ghost"
            size="sm"
            icon="Trash2"
            onClick={() => onDelete(question.Id)}
            className="text-red-500 hover:text-red-700 hover:bg-red-50"
          />
        </div>
      </div>
      
      {question.competencies && question.competencies.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {question.competencies.map((comp, index) => (
            <span
              key={index}
              className="px-2 py-1 text-xs font-medium bg-purple-100 text-purple-700 rounded-full"
            >
              {comp}
            </span>
          ))}
        </div>
      )}
    </Card>
  );
};

export default QuestionCard;