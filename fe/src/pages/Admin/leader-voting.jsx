import { Card, Tag, Button, Divider, Progress } from "antd"
import { leaderVotingData } from "../../data/mockData";

export function LeaderVoting() {
  return (
    <div className="space-y-4">
      {leaderVotingData.map((item) => (
        <Card key={item.key} className="bg-white border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-gray-900 font-semibold">{item.teamName}</h3>
            <Tag color="blue">Voting in Progress</Tag>
          </div>
          <div className="space-y-3">
            {item.candidates.map((candidate) => (
              <div key={candidate}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-gray-700">{candidate}</span>
                  <span className="text-gray-600 font-medium">{item.votes[candidate]} votes</span>
                </div>
                <Progress percent={(item.votes[candidate] / 5) * 100} strokeColor="#10b981" />
              </div>
            ))}
          </div>
          <Divider />
          <Button type="primary" className="bg-green-600 w-full">
            Assign Leader
          </Button>
        </Card>
      ))}
    </div>
  )
}
