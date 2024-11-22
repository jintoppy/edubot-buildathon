import React from 'react';
import { DashboardShell } from '@/components/dashboard/shell';
import { DashboardHeader } from '@/components/dashboard/header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Activity, Users, BookOpen, BarChart2, ArrowUp, ArrowDown, LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string;
  icon: LucideIcon;
  trend: 'up' | 'down';
  trendValue: number;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, icon: Icon, trend, trendValue }) => (
  <Card>
    <CardHeader className="flex flex-row items-center justify-between pb-2">
      <CardTitle className="text-sm font-medium">{title}</CardTitle>
      <Icon className="h-4 w-4 text-muted-foreground" />
    </CardHeader>
    <CardContent>
      <div className="text-2xl font-bold">{value}</div>
      <div className="flex items-center text-xs text-muted-foreground">
        {trend === 'up' ? (
          <ArrowUp className="h-4 w-4 text-green-500" />
        ) : (
          <ArrowDown className="h-4 w-4 text-red-500" />
        )}
        <span className={trend === 'up' ? 'text-green-500' : 'text-red-500'}>
          {trendValue}%
        </span>
        <span className="ml-1">from last month</span>
      </div>
    </CardContent>
  </Card>
);

interface ActivityItem {
  time: string;
  text: string;
}

const RecentActivity: React.FC = () => {
  const activities: ActivityItem[] = [
    { time: '2 hours ago', text: 'New program added: MS in Data Science' },
    { time: '5 hours ago', text: 'Student query pattern analysis completed' },
    { time: '1 day ago', text: 'System health check performed' },
  ];

  return (
    <Card className="col-span-2">
      <CardHeader>
        <CardTitle>Recent Activities</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {activities.map((activity, index) => (
            <div key={index} className="flex items-center space-x-4">
              <div className="h-2 w-2 rounded-full bg-blue-500" />
              <div>
                <p className="text-sm font-medium">{activity.text}</p>
                <p className="text-xs text-muted-foreground">{activity.time}</p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

interface SystemMetric {
  name: string;
  value: string;
}

const SystemHealth: React.FC = () => {
  const metrics: SystemMetric[] = [
    { name: 'AI Model Performance', value: '98%' },
    { name: 'API Response Time', value: '145ms' },
    { name: 'Database Status', value: 'Healthy' },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>System Health</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {metrics.map((metric, index) => (
            <div key={index} className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">{metric.name}</span>
              <span className="text-sm font-medium">{metric.value}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

const AdminDashboard: React.FC = () => {
  return (
    <DashboardShell>
      <DashboardHeader 
        heading="Admin Dashboard" 
        text="Overview of your system's performance and recent activities"
      />
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Active Students"
          value="1,234"
          icon={Users}
          trend="up"
          trendValue={12}
        />
        <StatCard
          title="Active Programs"
          value="89"
          icon={BookOpen}
          trend="up"
          trendValue={8}
        />
        <StatCard
          title="Daily Sessions"
          value="456"
          icon={Activity}
          trend="up"
          trendValue={15}
        />
        <StatCard
          title="Conversion Rate"
          value="24%"
          icon={BarChart2}
          trend="down"
          trendValue={3}
        />
      </div>

      <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-3 mt-4">
        <RecentActivity />
        <SystemHealth />
      </div>
    </DashboardShell>
  );
};

export default AdminDashboard;