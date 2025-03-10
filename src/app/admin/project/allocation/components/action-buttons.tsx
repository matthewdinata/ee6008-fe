import { History, Play, Save, Settings } from 'lucide-react';

import { Button } from '@/components/ui/button';

type ActionButtonsProps = {
	onGenerate: () => void;
	onSave: () => void;
	isGenerating: boolean;
	hasData: boolean;
};

export function ActionButtons({ onGenerate, onSave, isGenerating, hasData }: ActionButtonsProps) {
	return (
		<div className="flex flex-wrap justify-between items-center">
			<div className="flex flex-wrap gap-3 mr-auto">
				{/* TODO: add button functionalities and fix loading state */}
				<Button variant="default" onClick={onGenerate} disabled={isGenerating}>
					<Play className="w-4 h-4" />
					{isGenerating ? 'Generating...' : 'Generate Allocation'}
				</Button>
				<Button variant="outline">
					<Settings className="w-4 h-4" />
					Configuration
				</Button>
				<Button variant="outline" onClick={onSave} disabled={!hasData}>
					<Save className="w-4 h-4" />
					Save Draft
				</Button>
				<Button variant="outline" onClick={onSave} disabled={!hasData}>
					<History className="w-4 h-4" />
					History
				</Button>
			</div>
		</div>
	);
}
