import { Card, Button, Tag } from "antd"
import { suggestionsData } from "../../data/mockData";

export function Suggestions() {
  return (
    <div className="space-y-4">
      {suggestionsData.map((suggestion) => (
        <Card key={suggestion.key} className="bg-white border border-gray-200 shadow-sm">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h3 className="text-gray-900 font-semibold">{suggestion.teamName}</h3>
                <Tag color="green">Match: {suggestion.matchScore}%</Tag>
              </div>
              <p className="text-gray-600 text-sm mb-2">Members: {suggestion.members}/6</p>
              <div className="flex flex-wrap gap-2">
                {suggestion.rolesNeeded.map((role) => (
                  <Tag key={role} color="blue">
                    {role}
                  </Tag>
                ))}
              </div>
            </div>
            <Button type="primary" className="bg-green-600">
              Assign Student
            </Button>
          </div>
        </Card>
      ))}
    </div>
  )
}
