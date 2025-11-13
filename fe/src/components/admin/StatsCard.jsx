import { Card } from "antd"
// eslint-disable-next-line no-unused-vars
import { motion } from "framer-motion"
import { TrendingUp } from "lucide-react"

const StatsCard = ({ stat, index }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: index * 0.1 }}
  >
    <Card className="bg-white border-gray-200 hover:border-green-500 transition-all duration-300 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-600 text-sm mb-1">{stat.title}</p>
          <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
          <p className="text-green-500 text-sm mt-1 flex items-center gap-1">
            <TrendingUp className="w-4 h-4" />
            {stat.change}
          </p>
        </div>
        <div className={`${stat.color} p-3 rounded-lg text-white`}>{stat.icon}</div>
      </div>
    </Card>
  </motion.div>
)

export default StatsCard